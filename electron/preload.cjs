const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('calcRushDesktop', {
  platform: process.platform,
  version: '1.4.0',
  isDesktop: true,
});
