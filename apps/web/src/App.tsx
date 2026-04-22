import './styles/globals.css';
import { useEffect, useState } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Outlet, useNavigate, useParams } from 'react-router-dom';
import { useMIDIConnection } from './hooks/useMIDIConnection';
import { useAuth, AuthProvider } from './hooks/useAuth';
import { DeviceSelector } from './components/DeviceSelector';
import { MainLayout } from './components/MainLayout';
import { DeviceMismatchWarning } from './components/DeviceMismatchWarning';
import { LoginPage } from './components/auth/LoginPage';
import { AuthCallback } from './components/auth/AuthCallback';
import { MicrocosmEditor } from './components/pedals/microcosm';
import { ChromaConsoleEditor } from './components/pedals/chroma_console';
import { PreampMk2Editor } from './components/pedals/preamp_mk2';
import { Cxm1978Editor } from './components/pedals/cxm1978';
import { GenLossMkiiEditor } from './components/pedals/gen_loss_mkii';
import { CleanEditor } from './components/pedals/clean';
import { OnwardEditor } from './components/pedals/onward';
import { BrothersAmEditor } from './components/pedals/brothers_am';
import { ReverseModeCEditor } from './components/pedals/reverse_mode_c';
import { MoodMkiiEditor } from './components/pedals/mood_mkii';
import { BillyStringsWombtoneEditor } from './components/pedals/billy_strings_wombtone';
import { LossyEditor } from './components/pedals/lossy';
import { pedalRegistry } from './lib/midi/pedalRegistry';
import { detectDeviceMismatch } from './lib/midi/deviceMismatchDetection';
import type { PedalType } from './lib/midi/types';

// Self-register all pedal modules
import './lib/midi/pedals/microcosm';
import './lib/midi/pedals/gen-loss-mkii';
import './lib/midi/pedals/chroma_console';
import './lib/midi/pedals/preamp_mk2';
import './lib/midi/pedals/cxm1978';
import './lib/midi/pedals/clean';
import './lib/midi/pedals/onward';
import './lib/midi/pedals/brothers-am';
import './lib/midi/pedals/reverse-mode-c';
import './lib/midi/pedals/mood-mkii';
import './lib/midi/pedals/billy-strings-wombtone';
import './lib/midi/pedals/lossy';

// ─── Pedal Editor Router ──────────────────────────────────────────────────────

function ComingSoonEditor({ pedalType }: { pedalType: PedalType }) {
  const pedalDef = pedalRegistry.get(pedalType);
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="text-6xl mb-4">{pedalDef?.icon || '🎛️'}</div>
        <h2 className="text-2xl font-bold mb-2 text-text-primary">{pedalDef?.name || pedalType}</h2>
        <p className="text-text-secondary mb-4">{pedalDef?.manufacturer}</p>
        <div className="px-4 py-2 bg-warning/10 border border-warning/30 rounded-md inline-block">
          <p className="text-sm text-warning">Editor coming soon!</p>
        </div>
      </div>
    </div>
  );
}

function PedalEditorRoute() {
  const { pedalType } = useParams<{ pedalType: string }>();
  const navigate = useNavigate();
  const { devices, connectedDevice, isConnecting, isRefreshing, error, refreshDevices, connect, disconnect, connectMock } = useMIDIConnection();
  const [activePedalType, setActivePedalType] = useState<PedalType>(
    (pedalType as PedalType) || 'Microcosm'
  );
  const [showMismatchWarning, setShowMismatchWarning] = useState(false);

  useEffect(() => {
    if (pedalType) setActivePedalType(pedalType as PedalType);
  }, [pedalType]);

  const handleSwitchPedal = (newPedalType: PedalType) => {
    setActivePedalType(newPedalType);
    setShowMismatchWarning(true);
    navigate(`/pedals/${newPedalType}`, { replace: true });
  };

  if (!connectedDevice) {
    const handleConnect = async (deviceName: string, channel: number, type: PedalType) => {
      await connect(deviceName, channel, type);
      navigate(`/pedals/${type}`);
    };
    const handleConnectMock = (type: PedalType, channel?: number) => {
      connectMock?.(type, channel);
      navigate(`/pedals/${type}`);
    };
    return (
      <DeviceSelector
        devices={devices}
        isRefreshing={isRefreshing}
        isConnecting={isConnecting}
        error={error}
        onConnect={handleConnect}
        onRefresh={refreshDevices}
        onConnectMock={import.meta.env.DEV ? handleConnectMock : undefined}
      />
    );
  }

  const deviceMismatch = detectDeviceMismatch(connectedDevice.name, activePedalType);

  const renderEditor = () => {
    const pedalDef = pedalRegistry.get(activePedalType);
    if (!pedalDef?.hasEditor) return <ComingSoonEditor pedalType={activePedalType} />;

    switch (activePedalType) {
      case 'Microcosm': return <MicrocosmEditor deviceName={connectedDevice.name} />;
      case 'ChromaConsole': return <ChromaConsoleEditor deviceName={connectedDevice.name} />;
      case 'PreampMk2': return <PreampMk2Editor deviceName={connectedDevice.name} />;
      case 'Cxm1978': return <Cxm1978Editor deviceName={connectedDevice.name} />;
      case 'GenLossMkii': return <GenLossMkiiEditor deviceName={connectedDevice.name} />;
      case 'Clean': return <CleanEditor deviceName={connectedDevice.name} />;
      case 'Onward': return <OnwardEditor deviceName={connectedDevice.name} />;
      case 'BrothersAm': return <BrothersAmEditor deviceName={connectedDevice.name} />;
      case 'ReverseModeC': return <ReverseModeCEditor deviceName={connectedDevice.name} />;
      case 'MoodMkii': return <MoodMkiiEditor deviceName={connectedDevice.name} />;
      case 'BillyStringsWombtone': return <BillyStringsWombtoneEditor deviceName={connectedDevice.name} />;
      case 'Lossy': return <LossyEditor deviceName={connectedDevice.name} />;
      default: return <ComingSoonEditor pedalType={activePedalType} />;
    }
  };

  return (
    <MainLayout
      deviceInfo={connectedDevice}
      activePedalType={activePedalType}
      onDisconnect={disconnect}
      onSwitchPedal={handleSwitchPedal}
    >
      {deviceMismatch?.isMismatch && showMismatchWarning && (
        <div className="px-6 pt-4">
          <DeviceMismatchWarning
            mismatch={deviceMismatch}
            onDismiss={() => setShowMismatchWarning(false)}
            onDisconnect={disconnect}
          />
        </div>
      )}
      {renderEditor()}
    </MainLayout>
  );
}

// ─── Home / Device Select ─────────────────────────────────────────────────────

function HomePage() {
  const navigate = useNavigate();
  const { devices, connectedDevice, isConnecting, isRefreshing, error, refreshDevices, connect, connectMock } =
    useMIDIConnection();

  const handleConnect = async (
    deviceName: string,
    channel: number,
    pedalType: PedalType
  ) => {
    await connect(deviceName, channel, pedalType);
    navigate(`/pedals/${pedalType}`);
  };

  const handleConnectMock = (pedalType: PedalType, channel?: number) => {
    connectMock?.(pedalType, channel);
    navigate(`/pedals/${pedalType}`);
  };

  // If already connected, redirect to the active pedal
  if (connectedDevice) {
    return <Navigate to={`/pedals/${connectedDevice.pedal_type}`} replace />;
  }

  return (
    <DeviceSelector
      devices={devices}
      isRefreshing={isRefreshing}
      isConnecting={isConnecting}
      error={error}
      onConnect={handleConnect}
      onRefresh={refreshDevices}
      onConnectMock={import.meta.env.DEV ? handleConnectMock : undefined}
    />
  );
}

// ─── Auth Guard ──────────────────────────────────────────────────────────────

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isVerifying } = useAuth();

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg">
        <p className="text-text-secondary">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// ─── Router ───────────────────────────────────────────────────────────────────

function AuthLayout() {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
}

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/auth/callback',
        element: <AuthCallback />,
      },
      {
        path: '/',
        element: <RequireAuth><HomePage /></RequireAuth>,
      },
      {
        path: '/pedals/:pedalType',
        element: <RequireAuth><PedalEditorRoute /></RequireAuth>,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default function App() {
  return (
    <div className="min-h-screen bg-app-bg text-text-primary">
      <RouterProvider router={router} />
    </div>
  );
}
