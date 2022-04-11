<script type="ts" async>
  import { open, message, confirm } from '@tauri-apps/api/dialog';
  import { removeFile, readDir, readTextFile, renameFile, writeFile, type FileEntry } from '@tauri-apps/api/fs';

  import type { ChangedFileEntry, HighlightFileEntry, LogItem, FileType } from 'src/app';

  import {
    RoundVideocam,
    RoundSubtitles,
    RoundSubtitlesOff,
    RoundVideocamOff,
    RoundUndo,
    RoundRestartAlt,
    RoundDeleteSweep,
  } from '$lib/components/icons';
  import { ActionButton, Input, ListBox, SelectPath } from '$lib/components';
  import {
    filterFile,
    filterLogItems,
    getFileExt,
    getFileName,
    getLogItems,
    joinPaths,
    loadFileFilter,
    sortFilenameCb,
  } from '$lib/utils';

  // Supported video extensions
  // prettier-ignore
  const VIDEO_EXT: Array<string> = ['3g2', '3gp', '3gp2', '3gpp', 'amv', 'asf', 'avi', 'dav', 'divx', 'dv', 'evo', 'f4v', 'flv', 'hdmov', 'm1v', 'm2p', 'm2t', 'm2ts', 'm2v', 'm4v', 'mkv', 'mod', 'mov', 'mp2v', 'mp4', 'mp4v', 'mpe', 'mpeg', 'mpg', 'mpv2', 'mpv4', 'mts', 'mxf', 'ogm', 'ogv', 'pva', 'rm', 'rmvb', 'tp', 'tpr', 'ts', 'vob', 'webm', 'wmv'];
  // Supported subtitle extensions
  // prettier-ignore
  const SUBTITLE_EXT: Array<string> = ['aqt', 'ass', 'cvd', 'dks', 'idx', 'jss', 'mpl', 'pjs', 'psb', 'rt', 'smi', 'srt', 'ssa', 'ssf', 'sub', 'svcd', 'ttxt', 'txt', 'usf'];

  const FILE_TYPE_ZH: Record<FileType, string> = { video: '视频', subtitle: '字幕' };

  //#region state variables
  let sharePath: boolean = true;
  let videoPath: string = '';
  let subtitlePath: string = '';

  let videoFiles: Array<FileEntry> = [];
  let subtitleFiles: Array<FileEntry> = [];

  let selectedVideo: FileEntry = null;
  let selectSubtitle: FileEntry = null;

  let videoHighlightFile: HighlightFileEntry = null;
  let subtitleHighlightFile: HighlightFileEntry = null;

  let videoFilterStr: string = '';
  let subtitleFilterStr: string = '';
  let postfix: string = '';
  //#endregion

  //#region reactive statements
  $: loadFiles(videoPath, 'video');
  $: loadFiles(subtitlePath, 'subtitle');
  $: syncPath(sharePath);
  $: filterVideoCb = (fileEntry: FileEntry) => filterFile(fileEntry.name, videoFilterStr);
  $: filterSubtitleCb = (fileEntry: FileEntry) => filterFile(fileEntry.name, subtitleFilterStr);
  //#endregion

  /**
   * Sync subtitle path with video path.
   *
   * @param share share path or not
   */
  const syncPath = (share: boolean) => {
    if (share) {
      subtitlePath = videoPath;
      loadFiles(subtitlePath, 'subtitle');
    } else {
      subtitlePath = '';
      subtitleFiles = [];
    }
  };

  /**
   * Open and select a path.
   *
   * @param fileType video or subtitle
   */
  const selectPath = (fileType: FileType) => {
    open({ directory: true, title: `选择 ${FILE_TYPE_ZH[fileType]} 文件夹:` })
      .then((path) => {
        if (path) {
          if (fileType === 'video') {
            videoPath = (path as string) || '';
            if (sharePath) subtitlePath = videoPath; // sync subtitle path with video path
          } else {
            subtitlePath = (path as string) || '';
            if (subtitlePath !== videoPath) sharePath = false; // not the same path, uncheck share path
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  /**
   * Load files from path.
   *
   * @param path path string
   * @param fileType video or subtitle
   */
  const loadFiles = (path: string, fileType: FileType) => {
    if (path) {
      readDir(path)
        .then(async (files) => {
          const logitems = await getLogItems(videoPath);
          if (fileType === 'video') {
            videoFiles = files.filter((file) => loadFileFilter(file, VIDEO_EXT, filterLogItems(logitems, 'video')));
          } else {
            subtitleFiles = files.filter((file) =>
              loadFileFilter(file, SUBTITLE_EXT, filterLogItems(logitems, 'subtitle'))
            );
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  /**
   * Check both video or subtitle file are selected, send a warning if not.
   *
   * @returns warning triggered
   */
  const noSelectWarning = (): boolean => {
    if (!selectedVideo) {
      message('未选择视频文件！');
      return true;
    }
    if (!selectSubtitle) {
      message('未选择字幕文件！');
      return true;
    }
    return false;
  };

  /**
   * Rename a file.
   *
   * @param fileType rename a video or a subtitle file
   */
  const rename = async (fileType: FileType) => {
    if (noSelectWarning() || typeof navigator === 'undefined') return;

    const { join } = await import('@tauri-apps/api/path');
    if (fileType === 'video') {
      const newFileName = `${getFileName(selectSubtitle.name)}${postfix}.${getFileExt(selectedVideo.name)}`;
      const changedFile: ChangedFileEntry = {
        type: 'video',
        name: newFileName,
        path: await join(videoPath, newFileName),
      };
      renameFile(selectedVideo.path, changedFile.path)
        .then(() => {
          logAction(changedFile);
        })
        .catch(message);
    } else {
      const newFileName = `${getFileName(selectedVideo.name)}${postfix}.${getFileExt(selectSubtitle.name)}`;
      const changedFile: ChangedFileEntry = {
        type: 'subtitle',
        name: newFileName,
        path: await join(subtitlePath, newFileName),
      };
      renameFile(selectSubtitle.path, changedFile.path)
        .then(() => {
          logAction(changedFile);
        })
        .catch(message);
    }
  };

  /**
   * Log a rename action.
   *
   * @param changedFile changed file object.
   */
  const logAction = async (changedFile: ChangedFileEntry) => {
    const renameLogPath = await joinPaths(videoPath, 'subrename_log.json');
    const newLogItem: LogItem = { video: selectedVideo, subtitle: selectSubtitle, change: changedFile };

    await readTextFile(renameLogPath)
      .then(async (text) => {
        await writeFile({
          path: renameLogPath,
          contents: JSON.stringify([...((JSON.parse(text) || []) as Array<LogItem>), newLogItem], null, 2),
        });
      })
      .catch(async (_err) => {
        await writeFile({
          path: renameLogPath,
          contents: JSON.stringify([newLogItem], null, 2),
        });
      });
    delistFiles();
  };

  /**
   * Remove the current select video and subtitle file from the file lists.
   */
  const delistFiles = () => {
    const videoIdx = videoFiles.indexOf(selectedVideo);
    if (videoIdx > -1) videoFiles = [...videoFiles.slice(0, videoIdx), ...videoFiles.slice(videoIdx + 1)];
    const subIdx = subtitleFiles.indexOf(selectSubtitle);
    if (subIdx > -1) subtitleFiles = [...subtitleFiles.slice(0, subIdx), ...subtitleFiles.slice(subIdx + 1)];
  };

  /**
   * Show the new name of the current selected video file.
   */
  const highlightVideo = () => {
    if (selectedVideo && selectSubtitle) {
      videoHighlightFile = {
        ...selectedVideo,
        newName: `${getFileName(selectSubtitle.name)}${postfix}.${getFileExt(selectedVideo.name)}`,
      };
    }
  };

  /**
   * Show the ne wname of the current selected subtitle file.
   */
  const highlightSubtitle = () => {
    if (selectedVideo && selectSubtitle) {
      subtitleHighlightFile = {
        ...selectSubtitle,
        newName: `${getFileName(selectedVideo.name)}${postfix}.${getFileExt(selectSubtitle.name)}`,
      };
    }
  };

  /**
   * Undo the a rename action.
   *
   * @param logItem logged rename action item.
   */
  const undo = async (logItem: LogItem): Promise<boolean> => {
    let success = false;
    // add the files back to the file list array if undid successful
    const addBackFiles = () => {
      videoFiles = [...videoFiles, logItem.video].sort(sortFilenameCb);
      subtitleFiles = [...subtitleFiles, logItem.subtitle].sort(sortFilenameCb);
      success = true;
    };
    if (logItem.change.type === 'video') {
      await renameFile(logItem.change.path, logItem.video.path)
        .then(() => {
          addBackFiles();
        })
        .catch((err) => {
          message(err);
        });
    } else {
      await renameFile(logItem.change.path, logItem.subtitle.path)
        .then(() => {
          addBackFiles();
        })
        .catch((err) => {
          message(err);
        });
    }
    return success;
  };

  /**
   * Undo a previous rename action.
   */
  const undoOne = async () => {
    const renameLogPath = await joinPaths(videoPath, 'subrename_log.json');

    readTextFile(renameLogPath)
      .then(async (text) => {
        const logItems = (JSON.parse(text) || []) as Array<LogItem>;
        if (logItems.length > 0 && (await undo(logItems[logItems.length - 1]))) {
          await writeFile({ path: renameLogPath, contents: JSON.stringify(logItems.slice(0, -1), null, 2) });
        }
      })
      .catch((err) => {
        message(`撤销重命名记录失败：\n${err}`);
      });
  };

  /**
   * Undo all rename actions.
   */
  const undoAll = async () => {
    const renameLogPath = await joinPaths(videoPath, 'subrename_log.json');

    readTextFile(renameLogPath)
      .then(async (text) => {
        let logItems = (JSON.parse(text) || []) as Array<LogItem>;
        for (let i = logItems.length - 1 || 0; i >= 0; i--) {
          if (await undo(logItems[i])) logItems.splice(i, 1);
        }
        await writeFile({ path: renameLogPath, contents: JSON.stringify(logItems, null, 2) });
      })
      .catch((err) => {
        message(`撤销重命名记录失败：\n${err}`);
      });
  };

  /**
   * Delete the `subrename_log.json` file in the video folder.
   */
  const deleteLogs = async () => {
    if (!videoPath) {
      message('未选择视频文件夹！');
      return;
    }
    if (await confirm('删除重命名记录后将不能进行撤回操作，是否要删除？')) {
      removeFile(await joinPaths(videoPath, 'subrename_log.json'))
        .then(() => {
          message('重命名记录删除成功！');
        })
        .catch((err) => {
          message(
            `重命名记录删除失败，${
              typeof err === 'string' && err.includes('cannot find') ? '文件不存在' : '请手动删除'
            }！`
          );
        });
    }
  };
</script>

<div class="flex-grow">
  <!-- Video list section -->
  <div class="flex h-1/2 flex-col gap-y-2">
    <div class="flex select-none items-end justify-between border-b border-neutral-800 pb-1">
      <h1>
        <RoundVideocam class="-mt-1 inline h-6 w-6" />
        <span class="pl-0.5 text-lg font-bold">视频文件</span>
      </h1>
      <Input bind:value={videoFilterStr} placeholder="过滤视频文件..." />
    </div>
    <ListBox
      bind:selection={selectedVideo}
      highlightFile={videoHighlightFile}
      files={videoFiles.filter(filterVideoCb)}
    />
    <SelectPath path={videoPath} openFn={() => selectPath('video')} />
  </div>
  <!-- Subtitle list section -->
  <div class="flex h-1/2 flex-col gap-y-2 pt-4">
    <div class="flex select-none items-end justify-between border-b border-neutral-800 pb-1">
      <h1>
        <RoundSubtitles class="-mt-1 inline h-6 w-6" />
        <span class="pl-0.5 text-lg font-bold">字幕文件</span>
      </h1>
      <Input bind:value={subtitleFilterStr} placeholder="过滤字幕文件..." />
    </div>
    <ListBox
      bind:selection={selectSubtitle}
      highlightFile={subtitleHighlightFile}
      files={subtitleFiles.filter(filterSubtitleCb)}
    />
    <SelectPath path={subtitlePath} openFn={() => selectPath('subtitle')} />
  </div>
</div>
<div class="flex items-center justify-end gap-x-1.5 pt-1">
  <input type="checkbox" id="share-path" bind:checked={sharePath} class="h-3 w-3" />
  <label for="share-path" class="text-xs">同视频文件夹</label>
</div>
<div class="mt-4 flex justify-between border-t border-neutral-800 pt-4">
  <Input bind:value={postfix} placeholder="输入尾缀(可选)..." />
  <div class="flex gap-x-2">
    <ActionButton
      on:click={() => rename('subtitle')}
      on:mouseenter={highlightSubtitle}
      on:mouseleave={() => {
        subtitleHighlightFile = null;
      }}
    >
      <RoundSubtitlesOff class="inline h-5 w-5" />
      <span>重命名字幕</span>
    </ActionButton>
    <ActionButton
      on:click={() => rename('video')}
      on:mouseenter={highlightVideo}
      on:mouseleave={() => {
        videoHighlightFile = null;
      }}
    >
      <RoundVideocamOff class="inline h-5 w-5" />
      <span>重命名视频</span>
    </ActionButton>
    <ActionButton on:click={undoOne}>
      <RoundUndo class="inline h-5 w-5" />
      <span>撤销</span>
    </ActionButton>
    <ActionButton on:click={undoAll}>
      <RoundRestartAlt class="inline h-5 w-5" />
      <span>全撤销</span>
    </ActionButton>
    <ActionButton on:click={deleteLogs}>
      <RoundDeleteSweep class="inline h-5 w-5" />
      <span>删除重命名记录</span>
    </ActionButton>
  </div>
</div>
