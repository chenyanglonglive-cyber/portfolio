export default {
  routes: [
    {
      method: 'POST',
      path: '/resume-requests/apply',
      handler: 'api::resume-request.resume-request.apply',
      config: {
        auth: false,
      },
    },
    {
      method: 'POST',
      path: '/feishu/card-callback',
      handler: 'api::resume-request.resume-request.cardCallback',
      config: {
        auth: false,
      },
    },
  ],
};
