import { readTextFile, type FileEntry } from '@tauri-apps/api/fs';
import { message } from '@tauri-apps/api/dialog';
import type { FileType, LogItem } from 'src/app';

/**
 * Get the extension of the file.
 *
 * @param file extire filen ame with extension
 * @returns extension only
 */
export const getFileExt = (file: string): string => {
  return file.split('.').pop() || '';
};

/**
 * Get the file name without extension.
 *
 * @param file extire file name with extension
 * @returns file name only
 */
export const getFileName = (file: string) => {
  return file.substring(0, file.lastIndexOf('.'));
};

/**
 * File name sorting callback function.
 *
 * @param fileA file name A
 * @param fileB file name B
 * @returns sorting number
 */
export const sortFilenameCb = (fileA: FileEntry, fileB: FileEntry) => {
  return fileA.path.localeCompare(fileB.path, undefined, { numeric: true, sensitivity: 'base' });
};

/**
 * Check file match the search criteria.
 *
 * @param fileName file name
 * @param filterString search search
 * @returns match search criteria
 */
export const filterFile = (fileName: string, filterString: string): boolean => {
  return filterString.split(/\s+/).every((word) => fileName.includes(word));
};

/**
 * Redudant `join()` function from "@tauri-apps/api/path"
 *
 * Dynamic import is using here because the os-check helper function of "@tauri-apps/api" is called when imports normally,
 * and it throws the "ReferenceError: navigator is not defined".
 *
 * @param path paths
 * @returns joined path
 */
export const joinPaths = async (...path: Array<string>): Promise<string> => {
  const { join } = await import('@tauri-apps/api/path');
  return join(...path);
};

/**
 * Get the log items from the log file of the video path.
 *
 * @param path directory of the log item
 * @returns log items array
 */
export const getLogItems = async (path: string): Promise<Array<LogItem>> => {
  try {
    return JSON.parse(await readTextFile(await joinPaths(path, 'subrename_log.json'))) as Array<LogItem>;
  } catch (error) {
    if (!error?.includes('os error 2')) await message(error?.message || error || '读取日志时发生未知错误。');
    return [];
  }
};

/**
 * Get the file path from the log items by target file type (video/subtitle).
 *
 * If the file is renamed, the get the renamed path, otherwise the original path.
 *
 * @param logItems list of log items
 * @param fileType target file type
 * @returns list of paths of the the target file type.
 */
export const filterLogItems = (logItems: Array<LogItem>, fileType: FileType): Array<string> => {
  return logItems.map((logItem) => (logItem.change.type === fileType ? logItem.change.path : logItem[fileType].path));
};

/**
 * Filter the file entries.
 * 
 * - not folder
 * - in the target extension list
 * - not in the path list
 *
 * @param file file entery
 * @param extList allowed extension list
 * @param paths ignore paths
 * @returns filter the file or not
 */
export const loadFileFilter = (file: FileEntry, extList: Array<string>, paths: Array<string>): boolean => {
  return !file.children && extList.includes(getFileExt(file.name).toLowerCase()) && !paths.includes(file.path);
};
