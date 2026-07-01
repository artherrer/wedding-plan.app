export default {
  routes: [
    {
      method: "POST",
      path: "/guests/confirm",
      handler: "guest.confirm",
      config: { auth: false },
    },
    {
      method: "GET",
      path: "/guests/invitation/:eventDocumentId/:code",
      handler: "guest.getInvitation",
      config: { auth: false },
    },
    {
      method: "GET",
      path: "/guests/search/:eventDocumentId",
      handler: "guest.searchGuests",
      config: { auth: false },
    },
  ],
};
