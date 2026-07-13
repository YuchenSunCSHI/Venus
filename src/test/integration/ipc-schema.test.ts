import { describe, expect, it } from 'vitest';
import { ipcSchemaFieldNames, tauriCommandNames } from '../../features/rest-space/desktop/ipc-schema';

const disallowedSensitiveFields = [
  'windowTitle',
  'activeWindowTitle',
  'foregroundWindowTitle',
  'meetingTitle',
  'meetingContent',
  'documentTitle',
  'documentText',
  'workText',
  'workContent',
  'clipboardText',
];

describe('本地 IPC schema 隐私边界', () => {
  it('不包含窗口标题、会议内容或工作文本字段', () => {
    const serializedSchema = JSON.stringify({ ipcSchemaFieldNames, tauriCommandNames });

    for (const field of disallowedSensitiveFields) {
      expect(serializedSchema).not.toContain(field);
    }
  });
});