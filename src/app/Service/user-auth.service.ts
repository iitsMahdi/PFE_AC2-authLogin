import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserAuthService {
  constructor() {}

  public setRoles(roles: []) {
    localStorage.setItem('roles', JSON.stringify(roles));
  }

  public getRoles(): string[] {
    const rolesJson = localStorage.getItem('roles');
    if (!rolesJson) {
      return [];
    }
    return JSON.parse(rolesJson);
  }

  public setToken(jwtToken: string) {
    localStorage.setItem('jwtToken', jwtToken);
  }

  public getToken(): string {
    return localStorage.getItem('jwtToken') ?? '';
  }
  public setRefToken(refToken: string) {
    localStorage.setItem('refToken', refToken);
  }

  public getRefToken(): string {
    return localStorage.getItem('refToken') ?? '';
  }

  public setEmail(Email: string) {
    localStorage.setItem('Email', Email);
  }

  public getEmail(): string {
    return localStorage.getItem('Email') ?? '';
  }

  public clear() {
    localStorage.clear();
  }

  public isLoggedIn() {
    return this.getRoles() && this.getToken();
  }

  public logOut(){
    return localStorage.removeItem('jwtToken')
  }

}
