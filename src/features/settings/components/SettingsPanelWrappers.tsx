import { useOutletContext } from "react-router-dom";
import { POSSettings } from "../types/settings.types";
import { AppearanceSettingsPanel } from "./AppearanceSettings";
import { NotificationSettingsPanel } from "./NotificationSettings";
import { BackupSettingsPanel } from "./BackupSettings";
import { ReceiptSettingsPanel } from "./ReceiptSettings";
import { TaxSettingsPanel } from "./TaxSettings";
import { SecuritySettingsPanel } from "./SecuritySettings";
import { SystemSettingsPanel } from "./SystemSettings";
import { HardwareSettingsPanel } from "./HardwareSettings";
import { WooCommerceSettingsPanel } from "./WooCommerceSettings";
import { CompanySettingsPanel } from "./CompanySettings";
import { PaymentSettingsPanel } from "./PaymentSettings";
import { ProductsSettingsPanel } from "./ProductsSettings";
import { EmailSettingsPanel } from "./EmailSettings";
import MonitoringSettings from "./MonitoringSettings";
import { ThemeSettings } from "./ThemeSettings";
import { GiftCardSettingsPanel } from "./GiftCardSettings";
import SettingsMigrationWrapper from "./SettingsMigrationWrapper";
import SessionSettings from "./SessionSettings";

// Define the type for the context provided by the outlet
type SettingsContextType = {
  settings: POSSettings;
  handleSettingsUpdate: (section: keyof POSSettings, newSettings: unknown) => void;
};

// Wrapper components for each settings panel that use the outlet context
export function AppearanceSettingsWrapper() {
  return (
    <AppearanceSettingsPanel />
  );
}

export function NotificationSettingsWrapper() {
  return (
    <NotificationSettingsPanel />
  );
}

export function BackupSettingsWrapper() {
  const { settings, handleSettingsUpdate } = useOutletContext<SettingsContextType>();
  return (
    <BackupSettingsPanel
      settings={settings.backup}
      onUpdate={(newSettings) => handleSettingsUpdate('backup', newSettings)}
    />
  );
}

export function ReceiptSettingsWrapper() {
  return (
    <ReceiptSettingsPanel />
  );
}

export function TaxSettingsWrapper() {
  return (
    <TaxSettingsPanel />
  );
}

export function SecuritySettingsWrapper() {
  return (
    <SecuritySettingsPanel />
  );
}

export function SystemSettingsWrapper() {
  return (
    <SystemSettingsPanel />
  );
}

export function HardwareSettingsWrapper() {
  return (
    <HardwareSettingsPanel />
  );
}

export function WooCommerceSettingsWrapper() {
  const { settings, handleSettingsUpdate } = useOutletContext<SettingsContextType>();
  return (
    <WooCommerceSettingsPanel
      settings={settings.woocommerce}
      onUpdate={(newSettings) => handleSettingsUpdate('woocommerce', newSettings)}
    />
  );
}

export function CompanySettingsWrapper() {
  return (
    <CompanySettingsPanel />
  );
}

export function PaymentSettingsWrapper() {
  return (
    <PaymentSettingsPanel />
  );
}

export function ProductsSettingsWrapper() {
  // For ProductsSettingsPanel, we don't need to pass any settings as it doesn't accept them
  return (
    <ProductsSettingsPanel />
  );
}

export function EmailSettingsWrapper() {
  return (
    <EmailSettingsPanel />
  );
}

export function MonitoringSettingsWrapper() {
  const { settings, handleSettingsUpdate } = useOutletContext<SettingsContextType>();
  return (
    <MonitoringSettings />
  );
}

export function ThemeSettingsWrapper() {
  return (
    <ThemeSettings />
  );
}

export function GiftCardSettingsWrapper() {
  return (
    <GiftCardSettingsPanel />
  );
}

// Session settings wrapper
export function SessionSettingsWrapper() {
  return (
    <SessionSettings />
  );
}

// Migration wrapper is imported directly in App.tsx
