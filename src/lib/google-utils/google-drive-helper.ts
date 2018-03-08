import { ajaxRequestRaw } from '../utils';


export namespace GoogleDriveHelper {
  export function createFileWithJSONContent(name: string, data: string | {}, metadata?: {}, patchId?: string) {
    const boundary = '-------315159265358979323846';
    const delimiter = '\r\n--' + boundary + '\r\n';
    const close_delim = '\r\n--' + boundary + '--';

    let metadata_full = {};
    let method_name = 'POST';

    let pathUrl = '/upload/drive/v3/files';

    if (patchId) {
      pathUrl += '/' + patchId;

      metadata_full = {
        'mimeType': 'text/plain',
      };

      method_name = 'PATCH';
    } else {
      metadata_full = {
        'name': name,
        'mimeType': 'text/plain',
        'parents': [],
      };
    }

    if (metadata) {
      Object.assign(metadata_full, metadata);
    }

    const multipartRequestBody =
      delimiter + 'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata_full) +
      delimiter + 'Content-Type: ' + metadata_full['mimeType'] + '\r\n\r\n' + JSON.stringify(data) +
      close_delim;

    return gapi.client.request({
      'path': pathUrl,
      'method': method_name,
      'params': { 'uploadType': 'multipart' },
      'headers': {
        'Content-Type': 'multipart/related; boundary="' + boundary + '"'
      },
      'body': multipartRequestBody
    });
  }

  export function getFileUrl(fileId: string, isRaw?: boolean) {
    if (isRaw == null) { isRaw = true; }
    return 'https://www.googleapis.com/drive/v3/files/' + fileId + '?alt=media';
  }

  export async function downloadFileRawWithAuth(fileId: string) {
    return ajaxRequestRaw(getFileUrl(fileId), 'GET', null, (req) => {
      req.setRequestHeader('Authorization', 'Bearer ' + gapi.auth.getToken().access_token);
      req.setRequestHeader('Access-Control-Allow-Origin', '*');
    });
  }
}
