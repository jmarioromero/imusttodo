var Constants = {
  baseURL: 'http://localhost/imusttodo/',
  remsURL: 'https://incandescent-inferno-4098.firebaseio.com/rems.json'
};

String.prototype.toDOM = function() {
  var elm = document.createElement('div'),
      docfrag = document.createDocumentFragment();
  elm.innerHTML = this;
  while ((child = elm.firstChild))
    docfrag.appendChild(child);
  return docfrag;
};

Object.prototype.loop = function(callback) {
  var obj = this,
      key = false,
      item = false;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      if(callback) {
        item = obj[key];
        if(item instanceof Object)
          item['key'] = key;
        callback(item);
      }
    }
  }
};

Object.prototype.isNodeList = function() {
  return (this instanceof NodeList);
};

Object.prototype.isHTMLElement = function() {
  return (this instanceof HTMLElement);
};

HTMLElement.prototype.appendFirst = function(childnode){
  if(this.firstChild)
    this.insertBefore(childnode, this.firstChild);
  else
    this.appendChild(childnode);
};

var UtilMod = (function(d) {
  return {

    callREST: function(method, data, callback, adddate) {
      if(adddate)
        data = UtilMod.addDateToData(data);
      data = UtilMod.jsonStringify(data);
      UtilMod.callAjax(Constants.remsURL, data, function(data) {
        data = JSON.parse(data);
        if(callback) {
          data = (method === 'POST' && data.name) ? data.name : data;
          callback(data);
        }
      }, method);
    },

    addDateToData: function(data) {
      data['date_added'] = data['date_modified'] = UtilMod.getTime();
      return data;
    },

    getTime: function() {
      return (new Date()).getTime();
    },

    cleanInputs: function(parent) {
      (parent.childNodes).loop(function(elm) {
        var type = (elm.type + '').toLowerCase();
        switch (type) {
          case 'text':
          case 'password':
          case 'textarea':
            elm.value = '';
            break;
          case 'radio':
          case 'checkbox':
            if (elm.checked)
              elm.checked = false;
            break;
          case 'select-one':
          case 'select-multi':
            elm.selectedIndex = -1;
            break;
          default:
            break;
        }
      });
    },

    getFormData: function(selector, asstring) {
      var data = {};
      var form = d.querySelector(selector);
      if(form) {
        (form.childNodes).loop(function(elm) {
          if(elm.name)
            data[elm.name] = elm.value;
        });
        data = UtilMod.addDateToData(data);
      }
      return asstring ? UtilMod.jsonStringify(data) : data;
    },

    addEvent: function(elm, event, callback) {
      if(elm) {
        if(elm.isNodeList()) {
          elm.loop(function(obj) {
            if(obj.isHTMLElement())
              UtilMod.setEvent(obj, event, callback);
          });
        } else
          UtilMod.setEvent(elm, event, callback);
      }
    },

    setEvent: function(elm, event, callback) {
      if(elm) {
        if (elm.removeEventListener)
            elm.removeEventListener(event);
        else if (elm.detachEvent)
            elm.detachEvent('on' + event);
        elm.addEventListener(event, function(evt) {
          if(callback)
            callback(this);
          var evt = evt ? evt : window.event;
          if(evt.preventDefault)
            evt.preventDefault();
          evt.returnValue = false;
          return false;
        });
      }
    },

    jsonStringify: function(jsonobj, printlog, space) {
      var jsonstr = JSON.stringify(jsonobj, null, space || 2);
      if(printlog)
        console.log(jsonstr);
      return jsonstr;
    },

    getParamURL: function(param) {
      var regex = new RegExp('[\?\&]' + param + '=([^\&]*)(\&?)', 'i');
      var matches = location.search.match(regex);
      return matches ? matches[1] || false : false;
    },

    formatDate: function(timestamp) {
      var options = {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      };
      var date = new Date(timestamp);
      var datetimeformat = new Intl.DateTimeFormat(undefined, options);
      return datetimeformat.format(date);
    },

    getHTML: function(template, obj) {
      var templateTmp = template;
      Object.getOwnPropertyNames(obj).forEach(function (key) {
        var regex = new RegExp('{{' + key + '}}', 'ig');
        templateTmp = templateTmp.replace(regex, obj[key]);
      });
      return templateTmp;
    },

    callAjax: function(url, data, callback, method) {
      var xmlhttp = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
      xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
          if(callback)
            callback(xmlhttp.responseText);
      };
      xmlhttp.open(method || 'POST', url, true);
      xmlhttp.send(data);
    },

    jsonp: function(url, callback) {
      var callbackname = 'jsonp_callback_' + Math.round(100000 * Math.random());
      window[callbackname] = function(data) {
          delete window[callbackname];
          d.body.removeChild(script);
          callback(data);
      };
      var script = d.createElement('script');
      script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackname;
      d.body.appendChild(script);
    }
  };
}(document));