import 'babel-polyfill';
import Express from 'express';
import url from 'url';
import axios from 'axios';
import session from 'express-session';
import methodOverride from 'method-override';

const MemoryStore = require('memorystore')(session);

const app = new Express();
app.use(methodOverride('_method'));
app.set('views', './src/views');
app.set('view engine', 'pug');

app.use(session({
  secret: 'secret key',
  store: new MemoryStore({
    checkPeriod: 60000,
  }),
  name: 'user',
  cookie: { maxAge: 60000 },
}));

app.use((req, res, next) => {
  if (req.session && req.session.isUser) {
    res.locals.isUser = true;
    res.locals.items = req.session.items;
  } else {
    res.locals.isUser = false;
  }
  next();
});

app.get('/', (req, res) => {
  const initRequestParams = {
    protocol: 'https:',
    hostname: 'oauth.vk.com',
    pathname: '/authorize',
    query: {
      client_id: 6354655,
      display: 'page',
      redirect_uri: 'https://vk-auth-rytikov.herokuapp.com/auth',
      scope: 'friends',
      response_type: 'code',
      v: 5.71,
    },
  };
  res.render('index', { url: url.format(initRequestParams) });
});

app.get('/auth', async (req, res) => {
  const { query: { code } } = url.parse(req.url, true);
  const tokenRequestParams = {
    protocol: 'https:',
    hostname: 'oauth.vk.com',
    pathname: '/access_token',
    query: {
      client_id: 6354655,
      client_secret: '0wc4dXgOaXDMZsil1US2',
      redirect_uri: 'https://vk-auth-rytikov.herokuapp.com/auth',
      code,
    },
  };
  const { data: { user_id, access_token } } = await axios.get(url.format(tokenRequestParams));
  const userInfoRequestParams = {
    protocol: 'https:',
    hostname: 'api.vk.com',
    pathname: '/method/users.get',
    query: {
      user_ids: user_id,
      v: 5.71,
    },
  };
  const {
    data: {
      response: [
        { first_name, last_name },
      ],
    },
  } = await axios.get(url.format(userInfoRequestParams));
  const friendsRequestParams = {
    protocol: 'https:',
    hostname: 'api.vk.com',
    pathname: '/method/friends.get',
    query: {
      order: 'random',
      fields: 'online',
      count: 5,
      access_token,
      v: 5.71,
    },
  };
  const { data: { response: { items } } } = await axios.get(url.format(friendsRequestParams));
  req.session.isUser = true;
  req.session.items = items;
  res.render('index', {
    isUser: true,
    items,
    first_name,
    last_name,
  });
});

app.delete('/session', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    } else {
      res.clearCookie('user');
      res.redirect('/');
    }
  });
});

app.listen(process.env.PORT || 5000);
