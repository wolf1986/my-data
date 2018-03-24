export type Action<T> = (param?: T) => void;
export type Dictionary<T> = { [key: string]: T };

export function objectClear(targetObject) {
  Object.keys(targetObject).forEach(function(key) {
    delete targetObject[key];
  });
}

export function objectClone(sourceObject) {
  const targetObject = {};

  Object.assign(targetObject, sourceObject);
  return targetObject;
}

export class Deferred {
  reject: (reason?: any) => void;
  resolve: (value?: {} | PromiseLike<{}>) => void;
  promise: Promise<{}>;

  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

export function ajaxRequestRaw(
  url,
  method?: string,
  data?: any,
  funcChangeReqBeforeSend?: Action<XMLHttpRequest>
): Promise<XMLHttpRequest> {
  /**
   * Wrapper for XMLHttpRequest with promises.
   * @param method - GET or POST
   * @param data - Only for POST requests; Will be JSON.stringify before send
   * @param funcChangeReqBeforeSend - Hook to change request before send; i.e. Add headers
   */

  if (!method) {
    method = "GET";
  }

  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest();

    req.open(method, url);
    req.onload = function() {
      if (req.status === 200) {
        resolve(req);
      } else {
        reject(req);
      }
    };

    req.onerror = function() {
      reject(new Error("Network error"));
    };

    if (method === "POST" && data) {
      req.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    }

    if (funcChangeReqBeforeSend) {
      funcChangeReqBeforeSend(req);
    }

    req.send(JSON.stringify(data));
  });
}

export function prettyStringify(obj) {
  return JSON.stringify(obj, null, 4);
}

export function getFilenameWithoutExtension(filename) {
  return filename.replace(/(.*)\.[^/.]+$/, "$1");
}

export function getFilenameExtension(filename) {
  filename = "" + filename;
  const extension = filename.split(".").pop();
  if (extension === filename) {
    return "";
  }
  return "." + extension;
}

export function regexEscape(str) {
  return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

export function replaceAll(target, search, replacement) {
  return target.split(search).join(replacement);
}

export function trim(str, listChars) {
  const listCharsRegex = regexEscape(listChars);
  return str.replace(new RegExp(`^[${listCharsRegex}]+|[${listCharsRegex}]+$`, "g"), "");
}

export function getGoogleThumbnailUrl(fileId, width = 640) {
  return `https://drive.google.com/thumbnail?authuser=0&sz=w${width}&id=${fileId}`;
}
