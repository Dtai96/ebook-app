const { withAndroidManifest } = require('@expo/config-plugins');

/** Allow Android builds to load the project's HTTP API and book covers. */
module.exports = function withAndroidCleartextTraffic(config) {
  return withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    if (application) {
      application.$['android:usesCleartextTraffic'] = 'true';
    }
    return config;
  });
};
