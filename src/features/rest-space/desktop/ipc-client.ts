import { invoke } from '@tauri-apps/api/core';
import { listen, type EventCallback, type UnlistenFn } from '@tauri-apps/api/event';
import type { DomainEventPayloads } from '../../../shared/events/domain-events';
import { tauriCommandNames, type IpcCommandMap } from './ipc-schema';

export async function callTauriCommand<TCommand extends keyof IpcCommandMap>(
  command: TCommand,
  input: IpcCommandMap[TCommand]['input'],
): Promise<IpcCommandMap[TCommand]['output']> {
  const tauriCommand = tauriCommandNames[command];
  const args = input === undefined ? undefined : { input };
  return invoke<IpcCommandMap[TCommand]['output']>(tauriCommand, args);
}

export function listenToDomainEvent<TEventName extends keyof DomainEventPayloads>(
  eventName: TEventName,
  callback: EventCallback<DomainEventPayloads[TEventName]>,
): Promise<UnlistenFn> {
  return listen<DomainEventPayloads[TEventName]>(eventName, callback);
}