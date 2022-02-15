function bootstrap() {
  const script = new Bootstrap();
  script.run();
}

function forceBootstrap() {
  const script = new Bootstrap();
  script.reset();
}

function init() {
  // Bootstrap
  // Apply migrations
  // Apply formating
  bootstrap();
}

// function onOpen(_e) {
//   const email = Session.getActiveUser().getEmail();
//   Logger.log(email);
// }
