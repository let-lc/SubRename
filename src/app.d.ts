/// <reference types="@sveltejs/kit" />

import type { FileEntry } from '@tauri-apps/api/fs';

// See https://kit.svelte.dev/docs/types#the-app-namespace
// for information about these interfaces
declare namespace App {
  // interface Locals {}
  // interface Platform {}
  // interface Session {}
  // interface Stuff {}
}

/**
 * Video or subtitle type.
 */
type FileType = 'video' | 'subtitle';

interface HighlightFileEntry extends FileEntry {
  newName: string;
}

interface ChangedFileEntry extends FileEntry {
  type: FileType;
}

interface LogItem {
  video: FileEntry;
  subtitle: FileEntry;
  change: ChangedFileEntry;
}
