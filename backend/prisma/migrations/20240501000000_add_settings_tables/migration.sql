-- CreateTable
CREATE TABLE "settings" (
    "id" SERIAL NOT NULL,
    "module" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings_history" (
    "id" SERIAL NOT NULL,
    "settings_id" INTEGER NOT NULL,
    "module" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changed_by_id" TEXT,
    "version" INTEGER NOT NULL,
    "change_type" TEXT NOT NULL,

    CONSTRAINT "settings_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "settings_module_key_key" ON "settings"("module", "key");

-- CreateIndex
CREATE INDEX "settings_module_idx" ON "settings"("module");

-- CreateIndex
CREATE INDEX "settings_history_settings_id_idx" ON "settings_history"("settings_id");

-- CreateIndex
CREATE INDEX "settings_history_module_idx" ON "settings_history"("module");

-- CreateIndex
CREATE INDEX "settings_history_changed_at_idx" ON "settings_history"("changed_at");

-- AddForeignKey
ALTER TABLE "settings_history" ADD CONSTRAINT "settings_history_settings_id_fkey" FOREIGN KEY ("settings_id") REFERENCES "settings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings_history" ADD CONSTRAINT "settings_history_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
