import { HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthService } from "./auth.service";

@Injectable()// is required to inject service in another service
export class AuthInterceptor implements HttpInterceptor { //sends only out going req

  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler){
    const authToken = this.authService.getToken();
    const authRequest = req.clone({
      headers: req.headers.set("authorization","Bearer " + authToken)//it adds the header
    })
    return next.handle(authRequest)// takes a req allow us to continue without any change
  }
}
