const app = require('./app');

async function startup() {
  try {
    const application = await app.create();

    const port = process.env.PORT || 3000;
    const server = application.listen(port, '0.0.0.0', () => {
      console.log(`elency-config listening on ${port}`);
    });

    process.on('SIGTERM', () => {
      console.log('Recieved SIGTERM: attempting gracefull shutdown.');

      server.close(() => {
        console.log('Closed out remaining connections. Shutting down...');
        process.exit();
      });
    });
  }
  catch (err) {
    // log error
    console.log(err);
    process.exit(1);
  }
}

startup();
