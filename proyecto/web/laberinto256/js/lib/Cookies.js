class Cookies {
    static get(name) {
      let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
      ));
 
      return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    static getStartsWith(word) {
        var cookies = document.cookie.split(';');
        var result = {};

        for (var cookie of cookies) {
            cookie = decodeURIComponent(cookie.trim());
            if (cookie.startsWith(word)) {
                var id = cookie.indexOf('=');
                var key = cookie.substr(0,id);
                var value = cookie.substr(id+1);
                result[key] = value;
            }
        }
        
        return result;
    }
  
    static set(name, value, options = {}) {        
        options = {
          path: '/',
          // add other defaults here if necessary
          ...options
        };
  
        if (options.expires instanceof Date) {
          options.expires = options.expires.toUTCString();
        }
  
        let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
  
        for (let optionKey in options) {
          updatedCookie += "; " + optionKey;
          let optionValue = options[optionKey];
          if (optionValue !== true) {
            updatedCookie += "=" + optionValue;
          }
        }
  
        document.cookie = updatedCookie;
      }
  
  
    static delete(name) {
      Cookies.set(name, "", {
        'max-age': -1
      })
    }
  }
  
  
  export { Cookies };