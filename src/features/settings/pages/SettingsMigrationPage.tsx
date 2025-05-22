import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import SettingsMigrationTool from '../components/SettingsMigrationTool';

/**
 * Settings Migration Page
 *
 * This page provides a UI for migrating settings from localStorage to the database.
 */
const SettingsMigrationPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Settings Migration"
        description="Migrate settings from localStorage to the database"
      />

      <div className="p-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>About Settings Migration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This tool helps migrate settings from localStorage to the database. This is a one-time operation
              that should be performed after upgrading to the new settings architecture.
            </p>
            <p className="text-sm text-muted-foreground">
              The migration process will:
            </p>
            <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
              <li>Identify all settings stored in localStorage</li>
              <li>Send them to the server for storage in the database</li>
              <li>Keep the localStorage values as a fallback for offline operation</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> This process is safe and non-destructive. Your existing settings will not be lost.
            </p>
          </CardContent>
        </Card>

        <SettingsMigrationTool />
      </div>
    </div>
  );
};

export default SettingsMigrationPage;
