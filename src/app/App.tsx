import { CadenceStatus } from '../features/rest-space/components/CadenceStatus';
import { RestPrompt } from '../features/rest-space/components/RestPrompt';
import { useRestSessionController } from '../features/rest-space/session/useRestSessionController';

export function App() {
  const restSession = useRestSessionController();

  return (
    <main className="app-shell" aria-label="Venus 休息空间">
      <CadenceStatus session={restSession.session} nextPromptAt={restSession.nextPromptAt} />
      <RestPrompt
        session={restSession.session}
        onAccept={restSession.acceptRest}
        onPostpone={restSession.postponeRest}
        onSkip={restSession.skipRest}
      />
    </main>
  );
}