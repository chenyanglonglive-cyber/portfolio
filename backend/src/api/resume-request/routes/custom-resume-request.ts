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
    {
      method: 'GET',
      path: '/feishu/approve',
      handler: 'api::resume-request.resume-request.approveLink',
      config: {
        auth: false,
      },
    },
    {
      method: 'GET',
      path: '/feishu/reject',
      handler: 'api::resume-request.resume-request.rejectLink',
      config: {
        auth: false,
      },
    },
  ],
};
