import type { FileEntry } from '@tauri-apps/api/fs';

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
 * @param fileB file name b
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
