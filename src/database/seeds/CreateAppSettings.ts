// src/seeds/CreateAppSettings.ts
import { Factory, Seeder } from "typeorm-seeding";
import { Connection } from "typeorm";
import { AppSetting } from "@base/api/models/AppConfig/AppSetting";

export class CreateAppSettings implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const appSettingRepo = connection.getRepository(AppSetting);

    // Define default settings
    const defaultSettings = [
      {
        key: "app_version",
        value: "1.0.0",
        theme: "light",
        language: "en",
        layout: "grid",
        version: "1.0.0",
        helpLinks: '{"support": "https://support.example.com", "faq": "https://example.com/faq"}',
      },
      // You can add additional default settings here...
    ];

    for (const settingData of defaultSettings) {
      // Check if setting already exists by key
      const existing = await appSettingRepo.findOne({ where: { key: settingData.key } });
      if (!existing) {
        const newSetting = appSettingRepo.create(settingData);
        await appSettingRepo.save(newSetting);
        console.log(`Created AppSetting: ${newSetting.key}`);
      } else {
        console.log(`AppSetting already exists: ${settingData.key}`);
      }
    }
  }
}