import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from 'src/app/Service/user.service';
import { User } from 'src/app/model/User';
import Swal from 'sweetalert2';
import { DepartementService } from 'src/app/Service/departement.service';
import { ProfileService } from 'src/app/Service/profile.service';
import { forkJoin } from 'rxjs';
import { DoorService } from 'src/app/Service/door.service';
import { CardSocketService } from 'src/app/Service/card-socket.service';


@Component({
  selector: 'app-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.css']
})
export class AddUserComponent implements OnInit{


  userInfForm !:FormGroup;
  userPrevForm !:FormGroup;
  userCredForm !:FormGroup;
  cardNumber!: string;
  departements:any;
  profiles:any
  portes:any
  selectedDoors: any[] = [];
  selectedDepts: any[] = [];
  selDr: any[] = [];
  step = 1;
  personal_step = false;
  address_step = false;
  education_step = false;
  idUser:any;
  user: User = new User();

  msg:any="123456789"

  constructor(
    private deptService: DepartementService,
    private profService:ProfileService,
    private router: Router,
    private formBuilder: FormBuilder ,
    private http:HttpClient,
    private userService: UserService,
    private doorServices : DoorService,
    private cardSocket:CardSocketService
    ) {}


  ngOnInit(): void {
    this.userInfForm=this.formBuilder.group({
      firstname:['',Validators.required],
      lastname:['',Validators.required],
      CIN:['',Validators.required],

      adresse:['',Validators.required],
      image:['',Validators.required],
      phone:['',Validators.required],
      profile:['',Validators.required],
      role:['',Validators.required],
    });

    this.userPrevForm=this.formBuilder.group({
      department:['',Validators.required],
      porte:['',Validators.required],
    });

    this.userCredForm=this.formBuilder.group({
      email:['',Validators.required, Validators.email],
      password:['',Validators.required],
      pin:['',Validators.required],
      card:['',Validators.required],
    });

    this.getDepatement();
    this.getProfiles();

    this.cardSocket.connect("websocket").subscribe(
      (message: any) => {
        this.userCredForm.controls["card"].setValue(message)
      },
      (error:any) => {
        console.error('WebSocket error:', error);
      }
    );


  }

  next(){

    if(this.step==1){
          this.personal_step = true;
          if (this.userInfForm.invalid) {
            return
          }
          this.step++;
          this.saveUI();
    }

    else if(this.step==2){
        this.address_step = true;
        if (this.userPrevForm.invalid) {
          return
        }
        this.step++;
    }
  }

  previous(){
    this.step--
    if(this.step==1){
      this.address_step = false;
    }
    if(this.step==2){
      this.education_step = false;
    }
  }

  getDepatement(){
    this.deptService.getDepList().subscribe((data)=>{
      this.departements=data;
      console.log(data);
    })}
    getProfiles(){
      this.profService.getProfilesList().subscribe((data)=>{
        this.profiles=data
        console.log(this.profiles)
      })
    }
    getPortes(dep:any){
      this.doorServices.getDoorByDep(dep).subscribe((data)=>{
        this.portes=data
        console.log("liste des portes")
        console.log(data)
      })
    }

  file!:File;
  onChangeimg(event:any){
    this.file=event.target.files[0]
  }
  uploadFile() {
    if (this.file) {
      const uploadData = new FormData();
      uploadData.append('file', this.file, this.file.name);

    const headers = new HttpHeaders();
    headers.append('Content-Type', 'multipart/form-data; boundary=----WebKitFormBoundary');
    this.http.post('http://localhost:8080/User/api/upload', uploadData, { headers: headers }).subscribe(
      response => {
        console.log('File uploaded successfully');
      },
      error => {
        console.log('File upload failed:', error);
      }
    );
    }
  }

  profile:string='';
  selectChangeProfile(event : any){
    this.profile=event.target.value;
  }

  checkedDep:boolean=false
  depName:string=''
  isCheckboxChecked(event: any,dep:any) {
    console.log("haw id dep : "+dep.idDep)
    if (event.target.checked) {
      this.checkedDep=true
      this.depName=dep.nomDep
      console.log("raw khtar checkedDep")
      this.getPortes(dep.idDep);
      //this.selectedDepts.push(data);
    }
  }

  isDoorChecked(event:any,data:any){
    if (event.target.checked) {
      this.selectedDoors.push(data)
      console.log("raw zed "+data)
      console.log(this.selectedDoors)
    }
  }

  pin:boolean=false
  isPinSelected(event:any){
    if (event.target.checked) {
      this.pin=true
    }
  }

  selectChangeDr(event : any){
    this.selDr.push(event.target.value);
  }

  departement:string='';
  selectChangeDep(event : any){
    this.departement=event.target.value;
  }

  role:string='';
  selectChangeRole(event : any){
    this.role=event.target.value;
  }

  saveUI(){
    this.user.firstname=this.userInfForm.value.firstname;
    this.user.lastname=this.userInfForm.value.lastname;
    this.user.cin=this.userInfForm.value.CIN;
    this.user.adresse=this.userInfForm.value.adresse;
    this.user.image=this.file.name;
    this.uploadFile()
    this.user.phone=this.userInfForm.value.phone;
    this.user.role=this.role;
    const profObs = this.profService.getProfById(Number(this.profile));
    forkJoin([profObs]).subscribe(([profData]) => {
      this.user.prof = profData;
    });
  }

  saveEmployee(){
    this.user.codeUid=this.userCredForm.value.card;
    this.user.codePin=this.userCredForm.value.pin;
    this.user.email=this.userCredForm.value.email;
    this.user.password=this.userCredForm.value.password



    /*
    this.userService.createUser(this.user,this.selectedDoors).subscribe(data => {
      Swal.fire({
          position: 'center',
          icon: 'success',
          title: 'User added successfully',
          showConfirmButton: false,
          timer: 1500
        });
        console.log(data);
        this.goToUserList();
      },
      error => console.log(error));*/
  }

  assignUser(id:any){
    for (let i = 0; i < this.selectedDoors.length; i++) {
      this.userService.assignPortes(this.selectedDoors[i],id).subscribe(()=>{
        console.log("zedetlek lbibeeen lel user")
      },
      error =>
              console.log(error));
              console.log("erroor")

    }
  }
  postUser(){
    this.saveEmployee()
    console.log(this.user)
    console.log(this.selectedDoors)

    this.userService.getUserByEmail(this.user.email).subscribe((dd:any)=>{
      if(!dd){
        this.http.post(`http://localhost:8080/User/add`,this.user).subscribe(data => {
          this.userService.MailingUserAccountCreated(this.user.email,this.user.password).subscribe((data)=>{
            console.error(data)
          },
          error => console.log(error))
          Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'User added successfully',
            showConfirmButton: false,
            timer: 1500
          });
          console.log(data);
          this.assignUser(data);
          this.goToUserList();
          return data
        },
        error => console.log(error));
      }else{
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: "User Exist , try to change you email !!"
        })
      }
    })
  }

  goToUserList(){
    this.router.navigate(['/alluser']);
  }

  onSubmit(){
    this.postUser();
  }

  sendM(){
    this.cardSocket.sendMessage(this.msg)
  }
}
