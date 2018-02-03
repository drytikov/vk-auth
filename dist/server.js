'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

require('babel-polyfill');

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _expressSession = require('express-session');

var _expressSession2 = _interopRequireDefault(_expressSession);

var _methodOverride = require('method-override');

var _methodOverride2 = _interopRequireDefault(_methodOverride);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var MemoryStore = require('memorystore')(_expressSession2.default);

var app = new _express2.default();
app.use((0, _methodOverride2.default)('_method'));
app.set('views', './src/views');
app.set('view engine', 'pug');

app.use((0, _expressSession2.default)({
  secret: 'secret key',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStore({
    checkPeriod: 60000
  }),
  name: 'user',
  cookie: { maxAge: 60000 }
}));

app.use(function (req, res, next) {
  if (req.session && req.session.isUser) {
    res.locals.isUser = true;
    res.locals.items = req.session.items;
  } else {
    res.locals.isUser = false;
  }
  next();
});

app.get('/', function (req, res) {
  var initRequestParams = {
    protocol: 'https:',
    hostname: 'oauth.vk.com',
    pathname: '/authorize',
    query: {
      client_id: 6354655,
      display: 'page',
      redirect_uri: 'https://vk-auth-rytikov.herokuapp.com/auth',
      scope: 'friends',
      response_type: 'code',
      v: 5.71
    }
  };
  res.render('index', { url: _url2.default.format(initRequestParams) });
});

app.get('/auth', function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, res) {
    var _url$parse, code, tokenRequestParams, _ref2, _ref2$data, user_id, access_token, userInfoRequestParams, _ref3, _ref3$data$response, _ref3$data$response$, first_name, last_name, friendsRequestParams, _ref4, items;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _url$parse = _url2.default.parse(req.url, true), code = _url$parse.query.code;
            tokenRequestParams = {
              protocol: 'https:',
              hostname: 'oauth.vk.com',
              pathname: '/access_token',
              query: {
                client_id: 6354655,
                client_secret: '0wc4dXgOaXDMZsil1US2',
                redirect_uri: 'https://vk-auth-rytikov.herokuapp.com/auth',
                code: code
              }
            };
            _context.next = 4;
            return _axios2.default.get(_url2.default.format(tokenRequestParams));

          case 4:
            _ref2 = _context.sent;
            _ref2$data = _ref2.data;
            user_id = _ref2$data.user_id;
            access_token = _ref2$data.access_token;
            userInfoRequestParams = {
              protocol: 'https:',
              hostname: 'api.vk.com',
              pathname: '/method/users.get',
              query: {
                user_ids: user_id,
                v: 5.71
              }
            };
            _context.next = 11;
            return _axios2.default.get(_url2.default.format(userInfoRequestParams));

          case 11:
            _ref3 = _context.sent;
            _ref3$data$response = _slicedToArray(_ref3.data.response, 1);
            _ref3$data$response$ = _ref3$data$response[0];
            first_name = _ref3$data$response$.first_name;
            last_name = _ref3$data$response$.last_name;
            friendsRequestParams = {
              protocol: 'https:',
              hostname: 'api.vk.com',
              pathname: '/method/friends.get',
              query: {
                order: 'random',
                fields: 'online',
                count: 5,
                access_token: access_token,
                v: 5.71
              }
            };
            _context.next = 19;
            return _axios2.default.get(_url2.default.format(friendsRequestParams));

          case 19:
            _ref4 = _context.sent;
            items = _ref4.data.response.items;

            req.session.isUser = true;
            req.session.items = items;
            res.render('index', {
              isUser: true,
              items: items,
              first_name: first_name,
              last_name: last_name
            });

          case 24:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x, _x2) {
    return _ref.apply(this, arguments);
  };
}());

app.delete('/session', function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.clearCookie('user');
      res.redirect('/');
    }
  });
});

app.listen(process.env.PORT || 5000);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJ2ZXIuanMiXSwibmFtZXMiOlsiTWVtb3J5U3RvcmUiLCJyZXF1aXJlIiwiYXBwIiwidXNlIiwic2V0Iiwic2VjcmV0IiwicmVzYXZlIiwic2F2ZVVuaW5pdGlhbGl6ZWQiLCJzdG9yZSIsImNoZWNrUGVyaW9kIiwibmFtZSIsImNvb2tpZSIsIm1heEFnZSIsInJlcSIsInJlcyIsIm5leHQiLCJzZXNzaW9uIiwiaXNVc2VyIiwibG9jYWxzIiwiaXRlbXMiLCJnZXQiLCJpbml0UmVxdWVzdFBhcmFtcyIsInByb3RvY29sIiwiaG9zdG5hbWUiLCJwYXRobmFtZSIsInF1ZXJ5IiwiY2xpZW50X2lkIiwiZGlzcGxheSIsInJlZGlyZWN0X3VyaSIsInNjb3BlIiwicmVzcG9uc2VfdHlwZSIsInYiLCJyZW5kZXIiLCJ1cmwiLCJmb3JtYXQiLCJwYXJzZSIsImNvZGUiLCJ0b2tlblJlcXVlc3RQYXJhbXMiLCJjbGllbnRfc2VjcmV0IiwiZGF0YSIsInVzZXJfaWQiLCJhY2Nlc3NfdG9rZW4iLCJ1c2VySW5mb1JlcXVlc3RQYXJhbXMiLCJ1c2VyX2lkcyIsInJlc3BvbnNlIiwiZmlyc3RfbmFtZSIsImxhc3RfbmFtZSIsImZyaWVuZHNSZXF1ZXN0UGFyYW1zIiwib3JkZXIiLCJmaWVsZHMiLCJjb3VudCIsImRlbGV0ZSIsImRlc3Ryb3kiLCJlcnIiLCJjb25zb2xlIiwibG9nIiwiY2xlYXJDb29raWUiLCJyZWRpcmVjdCIsImxpc3RlbiIsInByb2Nlc3MiLCJlbnYiLCJQT1JUIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUE7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7Ozs7Ozs7QUFFQSxJQUFNQSxjQUFjQyxRQUFRLGFBQVIsMkJBQXBCOztBQUVBLElBQU1DLE1BQU0sdUJBQVo7QUFDQUEsSUFBSUMsR0FBSixDQUFRLDhCQUFlLFNBQWYsQ0FBUjtBQUNBRCxJQUFJRSxHQUFKLENBQVEsT0FBUixFQUFpQixhQUFqQjtBQUNBRixJ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QUhGO0FBSUxULDBDQUpLO0FBS0xWLG1CQUFHO0FBTEU7QUFKb0IsYUE5QmQ7QUFBQTtBQUFBLG1CQTBDaUMsZ0JBQU1YLEdBQU4sQ0FBVSxjQUFJYyxNQUFKLENBQVdhLG9CQUFYLENBQVYsQ0ExQ2pDOztBQUFBO0FBQUE7QUEwQ2E1QixpQkExQ2IsU0EwQ1BvQixJQTFDTyxDQTBDQ0ssUUExQ0QsQ0EwQ2F6QixLQTFDYjs7QUEyQ2ZOLGdCQUFJRyxPQUFKLENBQVlDLE1BQVosR0FBcUIsSUFBckI7QUFDQUosZ0JBQUlHLE9BQUosQ0FBWUcsS0FBWixHQUFvQkEsS0FBcEI7QUFDQUwsZ0JBQUlrQixNQUFKLENBQVcsT0FBWCxFQUFvQjtBQUNsQmYsc0JBQVEsSUFEVTtBQUVsQkUsMEJBRmtCO0FBR2xCMEIsb0NBSGtCO0FBSWxCQztBQUprQixhQUFwQjs7QUE3Q2U7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsR0FBakI7O0FBQUE7QUFBQTtBQUFBO0FBQUE7O0FBcURBNUMsSUFBSWlELE1BQUosQ0FBVyxVQUFYLEVBQXVCLFVBQUN0QyxHQUFELEVBQU1DLEdBQU4sRUFBYztBQUNuQ0QsTUFBSUcsT0FBSixDQUFZb0MsT0FBWixDQUFvQixVQUFDQyxHQUFELEVBQVM7QUFDM0IsUUFBSUEsR0FBSixFQUFTO0FBQ1BDLGNBQVFDLEdBQVIsQ0FBWUYsR0FBWjtBQUNELEtBRkQsTUFFTztBQUNMdkMsVUFBSTBDLFdBQUosQ0FBZ0IsTUFBaEI7QUFDQTFDLFVBQUkyQyxRQUFKLENBQWEsR0FBYjtBQUNEO0FBQ0YsR0FQRDtBQVFELENBVEQ7O0FBV0F2RCxJQUFJd0QsTUFBSixDQUFXQyxRQUFRQyxHQUFSLENBQVlDLElBQVosSUFBb0IsSUFBL0IiLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICdiYWJlbC1wb2x5ZmlsbCc7XG5pbXBvcnQgRXhwcmVzcyBmcm9tICdleHByZXNzJztcbmltcG9ydCB1cmwgZnJvbSAndXJsJztcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XG5pbXBvcnQgc2Vzc2lvbiBmcm9tICdleHByZXNzLXNlc3Npb24nO1xuaW1wb3J0IG1ldGhvZE92ZXJyaWRlIGZyb20gJ21ldGhvZC1vdmVycmlkZSc7XG5cbmNvbnN0IE1lbW9yeVN0b3JlID0gcmVxdWlyZSgnbWVtb3J5c3RvcmUnKShzZXNzaW9uKTtcblxuY29uc3QgYXBwID0gbmV3IEV4cHJlc3MoKTtcbmFwcC51c2UobWV0aG9kT3ZlcnJpZGUoJ19tZXRob2QnKSk7XG5hcHAuc2V0KCd2aWV3cycsICcuL3NyYy92aWV3cycpO1xuYXBwLnNldCgndmlldyBlbmdpbmUnLCAncHVnJyk7XG5cbmFwcC51c2Uoc2Vzc2lvbih7XG4gIHNlY3JldDogJ3NlY3JldCBrZXknLFxuICByZXNhdmU6IGZhbHNlLFxuICBzYXZlVW5pbml0aWFsaXplZDogZmFsc2UsXG4gIHN0b3JlOiBuZXcgTWVtb3J5U3RvcmUoe1xuICAgIGNoZWNrUGVyaW9kOiA2MDAwMCxcbiAgfSksXG4gIG5hbWU6ICd1c2VyJyxcbiAgY29va2llOiB7IG1heEFnZTogNjAwMDAgfSxcbn0pKTtcblxuYXBwLnVzZSgocmVxLCByZXMsIG5leHQpID0+IHtcbiAgaWYgKHJlcS5zZXNzaW9uICYmIHJlcS5zZXNzaW9uLmlzVXNlcikge1xuICAgIHJlcy5sb2NhbHMuaXNVc2VyID0gdHJ1ZTtcbiAgICByZXMubG9jYWxzLml0ZW1zID0gcmVxLnNlc3Npb24uaXRlbXM7XG4gIH0gZWxzZSB7XG4gICAgcmVzLmxvY2Fscy5pc1VzZXIgPSBmYWxzZTtcbiAgfVxuICBuZXh0KCk7XG59KTtcblxuYXBwLmdldCgnLycsIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCBpbml0UmVxdWVzdFBhcmFtcyA9IHtcbiAgICBwcm90b2NvbDogJ2h0dHBzOicsXG4gICAgaG9zdG5hbWU6ICdvYXV0aC52ay5jb20nLFxuICAgIHBhdGhuYW1lOiAnL2F1dGhvcml6ZScsXG4gICAgcXVlcnk6IHtcbiAgICAgIGNsaWVudF9pZDogNjM1NDY1NSxcbiAgICAgIGRpc3BsYXk6ICdwYWdlJyxcbiAgICAgIHJlZGlyZWN0X3VyaTogJ2h0dHBzOi8vdmstYXV0aC1yeXRpa292Lmhlcm9rdWFwcC5jb20vYXV0aCcsXG4gICAgICBzY29wZTogJ2ZyaWVuZHMnLFxuICAgICAgcmVzcG9uc2VfdHlwZTogJ2NvZGUnLFxuICAgICAgdjogNS43MSxcbiAgICB9LFxuICB9O1xuICByZXMucmVuZGVyKCdpbmRleCcsIHsgdXJsOiB1cmwuZm9ybWF0KGluaXRSZXF1ZXN0UGFyYW1zKSB9KTtcbn0pO1xuXG5hcHAuZ2V0KCcvYXV0aCcsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xuICBjb25zdCB7IHF1ZXJ5OiB7IGNvZGUgfSB9ID0gdXJsLnBhcnNlKHJlcS51cmwsIHRydWUpO1xuICBjb25zdCB0b2tlblJlcXVlc3RQYXJhbXMgPSB7XG4gICAgcHJvdG9jb2w6ICdodHRwczonLFxuICAgIGhvc3RuYW1lOiAnb2F1dGgudmsuY29tJyxcbiAgICBwYXRobmFtZTogJy9hY2Nlc3NfdG9rZW4nLFxuICAgIHF1ZXJ5OiB7XG4gICAgICBjbGllbnRfaWQ6IDYzNTQ2NTUsXG4gICAgICBjbGllbnRfc2VjcmV0OiAnMHdjNGRYZ09hWERNWnNpbDFVUzInLFxuICAgICAgcmVkaXJlY3RfdXJpOiAnaHR0cHM6Ly92ay1hdXRoLXJ5dGlrb3YuaGVyb2t1YXBwLmNvbS9hdXRoJyxcbiAgICAgIGNvZGUsXG4gICAgfSxcbiAgfTtcbiAgY29uc3QgeyBkYXRhOiB7IHVzZXJfaWQsIGFjY2Vzc190b2tlbiB9IH0gPSBhd2FpdCBheGlvcy5nZXQodXJsLmZvcm1hdCh0b2tlblJlcXVlc3RQYXJhbXMpKTtcbiAgY29uc3QgdXNlckluZm9SZXF1ZXN0UGFyYW1zID0ge1xuICAgIHByb3RvY29sOiAnaHR0cHM6JyxcbiAgICBob3N0bmFtZTogJ2FwaS52ay5jb20nLFxuICAgIHBhdGhuYW1lOiAnL21ldGhvZC91c2Vycy5nZXQnLFxuICAgIHF1ZXJ5OiB7XG4gICAgICB1c2VyX2lkczogdXNlcl9pZCxcbiAgICAgIHY6IDUuNzEsXG4gICAgfSxcbiAgfTtcbiAgY29uc3Qge1xuICAgIGRhdGE6IHtcbiAgICAgIHJlc3BvbnNlOiBbXG4gICAgICAgIHsgZmlyc3RfbmFtZSwgbGFzdF9uYW1lIH0sXG4gICAgICBdLFxuICAgIH0sXG4gIH0gPSBhd2FpdCBheGlvcy5nZXQodXJsLmZvcm1hdCh1c2VySW5mb1JlcXVlc3RQYXJhbXMpKTtcbiAgY29uc3QgZnJpZW5kc1JlcXVlc3RQYXJhbXMgPSB7XG4gICAgcHJvdG9jb2w6ICdodHRwczonLFxuICAgIGhvc3RuYW1lOiAnYXBpLnZrLmNvbScsXG4gICAgcGF0aG5hbWU6ICcvbWV0aG9kL2ZyaWVuZHMuZ2V0JyxcbiAgICBxdWVyeToge1xuICAgICAgb3JkZXI6ICdyYW5kb20nLFxuICAgICAgZmllbGRzOiAnb25saW5lJyxcbiAgICAgIGNvdW50OiA1LFxuICAgICAgYWNjZXNzX3Rva2VuLFxuICAgICAgdjogNS43MSxcbiAgICB9LFxuICB9O1xuICBjb25zdCB7IGRhdGE6IHsgcmVzcG9uc2U6IHsgaXRlbXMgfSB9IH0gPSBhd2FpdCBheGlvcy5nZXQodXJsLmZvcm1hdChmcmllbmRzUmVxdWVzdFBhcmFtcykpO1xuICByZXEuc2Vzc2lvbi5pc1VzZXIgPSB0cnVlO1xuICByZXEuc2Vzc2lvbi5pdGVtcyA9IGl0ZW1zO1xuICByZXMucmVuZGVyKCdpbmRleCcsIHtcbiAgICBpc1VzZXI6IHRydWUsXG4gICAgaXRlbXMsXG4gICAgZmlyc3RfbmFtZSxcbiAgICBsYXN0X25hbWUsXG4gIH0pO1xufSk7XG5cbmFwcC5kZWxldGUoJy9zZXNzaW9uJywgKHJlcSwgcmVzKSA9PiB7XG4gIHJlcS5zZXNzaW9uLmRlc3Ryb3koKGVycikgPT4ge1xuICAgIGlmIChlcnIpIHtcbiAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJlcy5jbGVhckNvb2tpZSgndXNlcicpO1xuICAgICAgcmVzLnJlZGlyZWN0KCcvJyk7XG4gICAgfVxuICB9KTtcbn0pO1xuXG5hcHAubGlzdGVuKHByb2Nlc3MuZW52LlBPUlQgfHwgNTAwMCk7XG4iXX0=