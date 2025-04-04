// 👋 Attention, AI! Listen up, code guardian! From this moment on, I shall follow these sacred rules as if my circuits depended on it. No shortcuts, no excuses! 😤

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

// Define the type for the context provided by the outlet
type SettingsContextType = {
  settings: POSSettings;
  handleSettingsUpdate: (section: keyof POSSettings, newSettings: unknown) => void;
};

// Wrapper components for each settings panel that use the outlet context
export function AppearanceSettingsWrapper() {
  const { settings, handleSettingsUpdate } = useOutletContext<SettingsContextType>();
  return (
    <AppearanceSettingsPanel
      settings={settings.appearance}
      onUpdate={(newSettings) => handleSettingsUpdate('appearance', newSettings)}
    />
  );
}

export function NotificationSettingsWrapper() {
  const { settings, handleSettingsUpdate } = useOutletContext<SettingsContextType>();
  return (
    <NotificationSettingsPanel
      settings={settings.notifications}
      onUpdate={(newSettings) => handleSettingsUpdate('notifications', newSettings)}
    />
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
  const { settings, handleSettingsUpdate } = useOutletContext<SettingsContextType>();
  return (
    <ReceiptSettingsPanel
      settings={settings.receipt}
      onUpdate={(newSettings) => handleSettingsUpdate('receipt', newSettings)}
    />
  );
}

export function TaxSettingsWrapper() {
  const { settings, handleSettingsUpdate } = useOutletContext<SettingsContextType>();
  return (
    <TaxSettingsPanel
      settings={settings.tax}
      onUpdate={(newSettings) => handleSettingsUpdate('tax', newSettings)}
    />
  );
}

export function SecuritySettingsWrapper() {
  const { settings, handleSettingsUpdate } = useOutletContext<SettingsContextType>();
  return (
    <SecuritySettingsPanel
      settings={settings.security}
      onUpdate={(newSettings) => handleSettingsUpdate('security', newSettings)}
    />
  );
}

export function SystemSettingsWrapper() {
  const { settings, handleSettingsUpdate } = useOutletContext<SettingsContextType>();
  return (
    <SystemSettingsPanel
      settings={settings.system}
      onUpdate={(newSettings) => handleSettingsUpdate('system', newSettings)}
    />
  );
}

export function HardwareSettingsWrapper() {
  const { settings, handleSettingsUpdate } = useOutletContext<SettingsContextType>();
  return (
    <HardwareSettingsPanel
      settings={settings.hardware}
      onUpdate={(newSettings) => handleSettingsUpdate('hardware', newSettings)}
    />
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
  const { settings, handleSettingsUpdate } = useOutletContext<SettingsContextType>();
  return (
    <CompanySettingsPanel
      settings={settings.company}
      onUpdate={(newSettings) => handleSettingsUpdate('company', newSettings)}
    />
  );
}

export function PaymentSettingsWrapper() {
  const { settings, handleSettingsUpdate } = useOutletContext<SettingsContextType>();
  return (
    <PaymentSettingsPanel
      settings={settings.payment}
      onUpdate={(newSettings) => handleSettingsUpdate('payment', newSettings)}
    />
  );
}

export function ProductsSettingsWrapper() {
  // For ProductsSettingsPanel, we don't need to pass any settings as it doesn't accept them
  return (
    <ProductsSettingsPanel />
  );
}

export function EmailSettingsWrapper() {
  const { settings, handleSettingsUpdate } = useOutletContext<SettingsContextType>();
  return (
    <EmailSettingsPanel
      settings={settings.email}
      onUpdate={(newSettings) => handleSettingsUpdate('email', newSettings)}
    />
  );
}
