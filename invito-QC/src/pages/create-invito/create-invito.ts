import { Component } from '@angular/core';

import { NavController, NavParams, LoadingController, ToastController, DateTime, ActionSheetController } from 'ionic-angular';
import { HttpClient } from '@angular/common/http';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { File } from '@ionic-native/file';

import AWS from 'aws-sdk';


@Component({
  selector: 'page-create-invito',
  templateUrl: 'create-invito.html'
})
export class CreateInvitoPage {

  eventDetails: any = {};
  host: any;
  eventName: any;
  eventDate: any;
  reminder: any;
  loading: any;
  attachmentBuffer: any;
  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private http: HttpClient,
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private camera: Camera,
    private file: File) {

  }

  uploadPicture() {
  }

  invito() {
    console.log(this.eventDetails);

    if (this.attachmentBuffer != undefined) {
      let currentDate = new Date();
      const s3 = new AWS.S3({
        signatureVersion: 'v4',
        region: 'ap-south-1',
        accessKeyId: 'AKIAJCNBMY452PXJU4FQ',
        secretAccessKey: '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',
      });


      let params = {
        Bucket: 'invito',
        Key: this.eventDetails.eventName + '|' + currentDate.getTime() + '.jpeg',
        Expires: 60,
        ContentType: 'image/jpeg',
        ACL: 'private'
      };

      s3.getSignedUrl('putObject', params, (err, s3UploadSignedUrl) => {
        debugger;
        if (err) {
          console.log(err);
        }
        console.log(s3UploadSignedUrl);
        this.http.put(s3UploadSignedUrl, this.attachmentBuffer).subscribe(resp => {
          debugger;
          console.log(resp);

        }, error => {
          console.log(error);
        });
      });
    }
  }


  imageSource() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Choose from Gallery or Camera',
      buttons: [
        {
          text: 'Gallery',
          role: 'Gallery',
          icon: 'image',
          handler: () => {
            console.log('Load from Library clicked');
          }
        },
        {
          text: 'Camera',
          icon: 'camera',
          handler: () => {
            console.log('Use Camera clicked');
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });

    actionSheet.present();
  }

  eventAttachment(attachmentSource) {
    if (attachmentSource == 'photos') {
      this.takePictureUploadAWS(this.camera.PictureSourceType.PHOTOLIBRARY);
    } else {
      this.takePictureUploadAWS(this.camera.PictureSourceType.CAMERA);
    }
  }

  takePictureUploadAWS(sourceType) {
    this.loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });

    this.loading.present();

    const cameraOptions: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true,
      saveToPhotoAlbum: false,
      allowEdit: false,
      sourceType: sourceType
    }

    this.camera.getPicture(cameraOptions).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      //let base64Image = 'data:image/jpeg;base64,' + imageData;
      const fileUri = imageData;
      console.log(imageData);
      
      debugger;
      this.file.resolveLocalFilesystemUrl(fileUri).then(resolvedURL => {
        debugger;
        console.log(JSON.stringify(resolvedURL));
        let dirPath = resolvedURL.nativeURL;
        let dirPathSegments = dirPath.split('/');
        dirPathSegments.pop();
        dirPath = dirPathSegments.join('/');
        this.file.readAsArrayBuffer(dirPath, resolvedURL.name).then(buffer => {
          debugger;

          this.attachmentBuffer = buffer;
          /*
                    const s3 = new AWS.S3({
                      signatureVersion: 'v4',
                      region: 'ap-south-1',
                      accessKeyId: 'AKIAJCNBMY452PXJU4FQ',
                      secretAccessKey: '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',
                    });
          
          
                    let params = {
                      Bucket: 'invito',
                      Key: imageData.split('/')[imageData.split('/').length - 1],
                      Expires: 60,
                      ContentType: 'image/jpeg',
                      ACL: 'private'
                    };
          
                    s3.getSignedUrl('putObject', params, (err, s3UploadSignedUrl) => {
                      debugger;
                      if (err) {
                        console.log(err);
                      }
                      console.log(s3UploadSignedUrl);
                      this.http.put(s3UploadSignedUrl, buffer).subscribe(resp => {
                        debugger;
                        console.log(resp);
          
                      }, error => {
                        console.log(error);
                      });
                    });*/
          this.loading.dismiss();
        }, (err) => {
          console.log(err);
        });
      }, (err) => {
        console.log(err);
      });
    }, (err) => {
      console.log(err);
    });
  }

}
