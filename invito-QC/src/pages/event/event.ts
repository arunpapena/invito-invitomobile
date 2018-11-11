import { Component } from '@angular/core';

import { NavController, NavParams, LoadingController } from 'ionic-angular';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ActionSheetController } from 'ionic-angular'
import AWS from 'aws-sdk';
import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { File } from '@ionic-native/file';
import { CreateInvitoPage } from '../create-invito/create-invito';
@Component({
  selector: 'page-event',
  templateUrl: 'event.html'
})
export class EventsHomePage {

  cameraPicData: any;
  images: any = [];
  loading: any;
  awsimage: any;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private camera: Camera,
    private actionSheetCtrl: ActionSheetController,
    private loadingCtrl: LoadingController,
    private transfer: FileTransfer,
    private http: HttpClient,
    private file: File) {

    const s3 = new AWS.S3({
      signatureVersion: 'v4',
      region: 'us-east-1',
      accessKeyId: 'AKIAJCNBMY452PXJU4FQ',
      secretAccessKey: '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',
    });

    const s3Params = {
      Bucket: 'invito '
    }
  }



  ionViewWillLeave() {
    if (this.loading != undefined)
      this.loading.dismiss();
  }
  selectImagesFromGallery(sourceType) {

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
            this.takePictureUploadAWS(this.camera.PictureSourceType.PHOTOLIBRARY);
          }
        },
        {
          text: 'Camera',
          icon: 'camera',
          handler: () => {
            console.log('Use Camera clicked');
            this.takePictureUploadAWS(this.camera.PictureSourceType.CAMERA);
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
      this.loading.dismiss();
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

            /*let httpheaders = new HttpHeaders();
            httpheaders.append('Access-Control-Allow-Origin', '*');
            httpheaders.append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT');
            httpheaders.append('Content-Type', 'image/jpeg');
            httpheaders.append('x-amz-acl', 'private');
            */
            //this.http.put(s3UploadSignedUrl, buffer, { headers: httpheaders }).subscribe(resp => {
            this.http.put(s3UploadSignedUrl, buffer).subscribe(resp => {
              debugger;
              console.log(resp);

            }, error => {
              console.log(error);
            });
          });
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

  getAWSImage() {

    const s3 = new AWS.S3({
      signatureVersion: 'v4',
      region: 'ap-south-1',
      accessKeyId: 'AKIAJCNBMY452PXJU4FQ',
      secretAccessKey: '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',
    });


    let params = {
      Bucket: 'invito',
      Key: 'IMG_2715.JPG'
    };

    s3.getSignedUrl('getObject', params, (err, data) => {
      if (err) {
        console.log(err);
      }
      console.log(data);
      this.awsimage = data;
    });
  }

  createInvito() {
    this.navCtrl.push(CreateInvitoPage, {
    });
  }

}
