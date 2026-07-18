const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:admin@gym-system.com',
  'BNYg9AqgeKRTtXHh7Q0NZutq1soBTtqhff6bOBvUnpanoxARJXzrnRYtHLRqXttEfzd_XX1g559e1puCbWEFUpk',
  'vsDf_QMv6Fup74RxcKhJF_Azyax-Q8t76mfejhjvHLc'
);

const pushSubscription = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/fAqxNG98Wyc:APA91bHsgqULyQ83_buxCUUgCaYi1XZHG7mRDx17XxSvAGws28Cm0ek5DPiKhouYFFQnhedv1vBhJC0HofplGLgKpPqRypC0yfAEelpbgqM6LHBYdusmsWxw8-hJAylUacc138-e3aU6',
  keys: {
    p256dh: 'BBvshbCuCIHhMNubJodF4KfkAHeuJ4Ao8CoeQWXAYrpy2wCTXQLksiOxr2UvAWXY8tS7piABKICGd9DVXjNEIOM',
    auth: 'aYhwr6rBq0gnALSHO5nqHQ'
  }
};

const payload = JSON.stringify({
  title: 'Test Notification 3',
  body: 'This is a test notification from the script.',
  icon: '/logos/icon.png',
  badge: '/logos/icon.png',
  url: '/'
});

webpush.sendNotification(pushSubscription, payload)
  .then(res => console.log('Success:', res))
  .catch(err => console.error('Error:', err));
