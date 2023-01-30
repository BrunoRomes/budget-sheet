class MigrationManager {
  constructor() {
    this.metadataSheet = new MetadataSheet();
    this.versionMigrations = {
      1: [], // No migration, we always start in version 1
      2: [
        MonthMigrationV2.forAllMonths(),
        new InvestmentMigrationV2(),
        new OverviewMigrationV2(),
        new CashflowMigrationV2(),
      ],
      3: [new CashflowMigrationV3(), new OverviewMigrationV3()],
    };
  }

  run() {
    Logger.log('Starting Sheet Migrations');
    const startingVersion = this.metadataSheet.getLowestSheetVersion() + 1;
    this.applyMigrations(startingVersion, VERSION);
    this.metadataSheet.updateAllVersions(VERSION);
    Logger.log('Sheet migrations completed.');
  }

  applyMigrations(startingVersion, targetVersion) {
    for (let i = startingVersion; i <= targetVersion; i += 1) {
      const migrations = this.versionMigrations[`${i}`].flat();

      for (let j = 0; j < migrations.length; j += 1) {
        const migration = migrations[j];
        const key = migration.getSheetName();
        if (this.metadataSheet.getMetadata(key) < i) {
          Logger.log(`Migrating Sheet ${key} to version ${i}`);
          migration.run();
          this.metadataSheet.updateMetadata(key, i);
          this.metadataSheet.saveMetadata();
        }
      }
    }
  }

  getLowestVersion() {
    return this.metadataSheet.getLowestSheetVersion() + 1;
  }

  getNumberOfVersions() {
    return Object.keys(this.versionMigrations).length;
  }

  getPendingMigrationsForVersion(version) {
    const migrations = this.versionMigrations[`${version}`].flat();
    const pendingMigrations = [];
    for (let j = 0; j < migrations.length; j += 1) {
      const migration = migrations[j];
      const key = migration.getSheetName();
      if (this.metadataSheet.getMetadata(key) < version) {
        pendingMigrations.push({
          version,
          name: key,
          index: j,
        });
      }
    }

    return pendingMigrations;
  }

  applySingleMigration(version, name, index) {
    const migrations = this.versionMigrations[`${version}`].flat();
    const migration = migrations[index];
    const key = migration.getSheetName();
    if (key !== name) {
      throw new Error(
        `Error During Migration: expected name ${name}, but got ${key} for version ${version} and index ${index}`
      );
    }

    if (this.metadataSheet.getMetadata(key) < version) {
      Logger.log(`Migrating Sheet ${key} to version ${version}`);
      migration.run();
      this.metadataSheet.updateMetadata(key, version);
    }
  }

  updateMetadata(version, keys) {
    keys.forEach((key) => {
      this.metadataSheet.updateMetadata(key, version);
    });
    this.metadataSheet.saveMetadata();
  }
}

function testMigrationManager() {
  const m = new MigrationManager();
  m.run();
  Logger.log('ABC');
}
