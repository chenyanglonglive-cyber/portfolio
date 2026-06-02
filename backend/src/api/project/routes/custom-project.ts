export default {
  routes: [
    {
      method: 'POST',
      path: '/projects/:id/import-folder',
      handler: 'api::project.project.importFolder',
      config: {
        auth: false,
      },
    },
  ],
};
