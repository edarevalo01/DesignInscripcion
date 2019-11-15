import { Component, OnInit, Inject, ViewChild } from "@angular/core";
import { TipoDocumento } from "src/app/models/TipoDocumento";
import { TipoPrograma } from "src/app/models/TipoPrograma";
import { Programa } from "src/app/models/Programa";
import { PregradoService } from "src/app/services/pregrado.service";
import { FormGroup, FormBuilder, Validators, FormControl, FormGroupDirective, NgForm } from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { Mensaje } from "src/app/models/Mensaje";
import { CookieService } from "ngx-cookie-service";
import { DOCUMENT } from "@angular/common";

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

export interface DialogData {}

@Component({
  selector: "app-pregrado",
  templateUrl: "./pregrado.component.html",
  styleUrls: ["./pregrado.component.css"]
})
export class PregradoComponent implements OnInit {
  private tipoDocumentoSelected: string;
  private tiposDocumento: TipoDocumento[] = [
    { codigo: "T", nombre: "TARJETA DE IDENTIDAD" },
    { codigo: "C", nombre: "CÉDULA DE CIUDADANÍA" },
    { codigo: "P", nombre: "PASAPORTE" }
  ];
  private tiposPrograma: TipoPrograma[] = [
    { codigo: "1", nombre: "PREGRADO" },
    { codigo: "2", nombre: "POSGRADO" },
    { codigo: "3", nombre: "DOCTORADO" }
  ];
  private pantalla: number;
  private registrarInscripcionForm: FormGroup;
  private captchaForm: FormGroup;
  private siteKey: string;
  private programs: Programa[] = [];
  private titInscribite: string = environment.titInscribete;
  private lblInscribete: string = environment.lblInscribete;
  private titContinuar: string = environment.titContinuar;
  private lblContinuar: string = environment.lblContinuar;
  private lblRequerido: string = environment.lblRequerido;
  private lblSoloNumeros: string = environment.lblSoloNumeros;
  private lblCorreo: string = environment.lblCorreo;
  private lblTerminos: string = environment.lblTerminos;
  private lblTermCond: string = environment.lblTermCond;
  private lblInscribirme: string = environment.lblInscribirme;
  private lblContinuarr: string = environment.lblContinuarr;
  private msgHabeasData: string = environment.msgHabeasData;
  private programaSelected: Programa;
  private mensaje: Mensaje = new Mensaje();
  private loading: boolean = false;
  private dialogRef: any;
  private progSelected: any;
  private tipSelected: string = "";

  private formReducido: boolean = false;
  // private ls: string = "";

  constructor(
    private pregradoServ: PregradoService,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    private router: Router,
    private cookieService: CookieService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.registrarInscripcionForm = this.formBuilder.group({
      primerNombre: ["", Validators.required],
      segundoNombre: [""],
      primerApellido: ["", Validators.required],
      segundoApellido: [""],
      tipoDocumentoSelected: ["", Validators.required],
      documento: ["", [Validators.required, Validators.pattern("^[0-9]*$")]],
      correo: ["", [Validators.required, Validators.email]],
      celular: ["", [Validators.required, Validators.pattern("^[0-9]*$")]],
      tipoSelected: ["", Validators.required],
      programaSelected: ["", Validators.required],
      terminos: [false, Validators.requiredTrue]
    });

    var paramUrlPrograma = this.obtenerParametro("programa");
    if (paramUrlPrograma != 0) {
      this.formReducido = true;
      this.pantalla = 1;
      this.getProgramaParam(paramUrlPrograma);
    }
    // this.ls = this.obtenerParametro("lead_source") != 0 ? String(this.obtenerParametro("lead_source")) : "sepRebr5";
  }

  getProgramaParam(param): any {
    this.pregradoServ.getProgramasByTipo("1").subscribe(
      tiposObs => {
        tiposObs.forEach(program => {
          program.jornadas.forEach(jornad => {
            this.programs.push({
              nombre: program.nombre,
              jornada: jornad.jornada,
              codigo: program.codigo,
              inscripcion: jornad.inscripcion,
              jornadas: [],
              contacto: program.contacto,
              fa: program.fa,
              correo: program.correo
            });
          });
        });
        var res = this.programs.filter(prog => prog.codigo == param.substring(0, 2) && prog.jornada == param.substring(2, 3));
        this.programaSelected = res[0];
        if (this.programaSelected != undefined) {
          this.progSelected = this.programaSelected.codigo + this.programaSelected.jornada;
          this.registrarInscripcionForm.controls.programaSelected.setValue(this.progSelected);
          this.registrarInscripcionForm.controls.tipoSelected.setValue("1");
          this.tipSelected = "1";
        }
      },
      error => {},
      () => {
        if (this.tipSelected == "") {
          this.programs = [];
          this.pregradoServ.getProgramasByTipo("2").subscribe(
            tiposObs => {
              tiposObs.forEach(program => {
                program.jornadas.forEach(jornad => {
                  this.programs.push({
                    nombre: program.nombre,
                    jornada: jornad.jornada,
                    codigo: program.codigo,
                    inscripcion: jornad.inscripcion,
                    jornadas: [],
                    contacto: program.contacto,
                    fa: program.fa,
                    correo: program.correo
                  });
                });
              });
              var res = this.programs.filter(prog => prog.codigo == param.substring(0, 2) && prog.jornada == param.substring(2, 3));
              this.programaSelected = res[0];
              if (this.programaSelected != undefined) {
                this.progSelected = this.programaSelected.codigo + this.programaSelected.jornada;
                this.registrarInscripcionForm.controls.tipoSelected.setValue("2");
                this.registrarInscripcionForm.controls.programaSelected.setValue(this.progSelected);
                this.tipSelected = "2";
              }
            },
            error => {},
            () => {
              if (this.tipSelected == "") {
                this.programs = [
                  {
                    codigo: "1",
                    nombre: "DOCTORADO EN AGROCIENCIAS",
                    jornada: "N",
                    inscripcion: "S",
                    jornadas: [],
                    contacto: null,
                    fa: null,
                    correo: null
                  },
                  {
                    codigo: "2",
                    nombre: "DOCTORADO EN EDUCACIÓN",
                    jornada: "N",
                    inscripcion: "S",
                    jornadas: [],
                    contacto: null,
                    fa: null,
                    correo: null
                  }
                ];
                if (param.substring(0, 2) == "DA") {
                  this.registrarInscripcionForm.controls.programaSelected.setValue("1N");
                } else {
                  this.registrarInscripcionForm.controls.programaSelected.setValue("2N");
                }
                this.tipSelected = "3";
                this.registrarInscripcionForm.controls.tipoSelected.setValue("3");
              }
            }
          );
        }
      }
    );
  }

  ngOnInit() {
    this.siteKey = environment.siteKey;
    if (!this.formReducido) {
      this.pantalla = window.innerWidth <= 540 ? 1 : 2;
    }

    if (!this.cookieService.get(environment.cookieLeadSource)) {
      var ls = "";
      if ("0" != this.obtenerParametro("lead_source")) {
        ls = this.obtenerParametro("lead_source").toString();
      } else {
        ls = environment.leadSource;
      }
      this.cookieService.set(environment.cookieLeadSource, ls, 15 / 1440, "/", environment.dominio);
    }
  }
  public onResize(event) {
    if (!this.formReducido) {
      this.pantalla = event.target.innerWidth <= 540 ? 1 : 2;
    }
  }
  //programas
  public getProgramas() {
    var tipo = this.registrarInscripcionForm.controls.tipoSelected.value;
    if ("3" != tipo) {
      this.programs = [];
      this.pregradoServ.getProgramasByTipo(tipo).subscribe(
        tiposObs => {
          tiposObs.forEach(program => {
            program.jornadas.forEach(jornad => {
              this.programs.push({
                nombre: program.nombre,
                jornada: jornad.jornada,
                codigo: program.codigo,
                inscripcion: jornad.inscripcion,
                jornadas: [],
                contacto: program.contacto,
                fa: program.fa,
                correo: program.correo
              });
            });
          });
          //ordenar por nombre de programa
          this.programs.sort((n1, n2) => {
            var comp = (n1.nombre + n1.jornada).localeCompare(n2.nombre + n2.jornada);
            if (comp > 1) {
              return 1;
            }
            if (comp < 1) {
              return -1;
            }
            return 0;
          });
        },
        error => {}
      );
    } else {
      //doctorados
      this.programs = [
        {
          codigo: "1",
          nombre: "DOCTORADO EN AGROCIENCIAS",
          jornada: "N",
          inscripcion: "S",
          jornadas: [],
          contacto: null,
          fa: null,
          correo: null
        },
        {
          codigo: "2",
          nombre: "DOCTORADO EN EDUCACIÓN",
          jornada: "N",
          inscripcion: "S",
          jornadas: [],
          contacto: null,
          fa: null,
          correo: null
        }
      ];
    }
  }
  //inscripciÓn
  public enviarDatosInscripcion(captchaCode) {
    this.loading = true;
    var respCaptcha = captchaCode;
    if (this.registrarInscripcionForm.invalid) {
      this.registrarInscripcionForm.markAllAsTouched();
      this.loading = false;
      return;
    } else {
      var prog = this.registrarInscripcionForm.controls.programaSelected.value;
      this.getProgramaSeleccionado(prog);
      var cookieLs = this.cookieService.get(environment.cookieLeadSource).toString();
      this.pregradoServ.guardarParte1(this.registrarInscripcionForm, this.programaSelected, respCaptcha, cookieLs).subscribe(
        tiposObs => {
          this.mensaje = tiposObs;
          if ("fail" != this.mensaje.status) {
            var tipDoc = this.registrarInscripcionForm.controls.tipoDocumentoSelected.value;
            this.openGracias(tipDoc);
          } else {
            this.openMensajes(environment.titMensaje, this.mensaje.mensaje, 0);
          }
        },
        error => {}
      );
    }
    this.loading = false;
  }
  //continuar
  public continuarProceso() {
    // this.router.navigateByUrl("/continuar?lead_source=" + this.obtenerParametro('lead_source'));
    this.router.navigate(["/continuar"], { queryParams: { lead_source: this.obtenerParametro("lead_source") } });
  }

  public cambiarPantalla() {
    //href='/continuar?lead_source=sepRebr5' target="_blank"
    window.open(
      "/#/continuar?lead_source=" + (this.obtenerParametro("lead_source") != 0 ? String(this.obtenerParametro("lead_source")) : "sepRebr5"),
      "_blank"
    );
  }
  //programa seleccionado
  public getProgramaSeleccionado(progSelected: string): void {
    this.programaSelected = new Programa();
    for (let prog of this.programs) {
      if (prog.codigo || prog.jornada == progSelected) {
        this.programaSelected = prog;
        break;
      }
    }
  }
  //ventana mensajes
  public openMensajes(titulo: string, mensaje: string, opcion: number): void {
    this.dialogRef = this.dialog.open(VentanaDialogoMensajesPreg, {
      width: "35%",
      data: { titulo: titulo, mensaje: mensaje, opcion: opcion },
      disableClose: 1 == opcion || 2 == opcion ? true : false
    });

    this.dialogRef.afterClosed().subscribe(result => {});
  }
  //ventana habeas data
  public openHabeasData(): void {
    this.openMensajes(environment.titHabeasData, this.msgHabeasData, 0);
  }
  //ventana gracias
  public openGracias(tipoDoc: string): void {
    if ("P" == tipoDoc) {
      this.openMensajes(environment.titGracias, environment.msgGraciasExt, 2);
      setTimeout(function() {
        this.document.location.href = environment.urlPaginaUniver;
      }, 5000);
    } else {
      this.openMensajes(environment.titGracias, environment.msgGracias, 1);
      var tipo = this.registrarInscripcionForm.controls.tipoSelected.value;
      var programa = this.registrarInscripcionForm.controls.programaSelected.value;
      var documento = this.registrarInscripcionForm.controls.documento.value;
      if ("3" != tipo) {
        if ("1" == tipo || "2" == tipo) {
          this.pregradoServ.validarContinuar(documento, programa.substring(0, 2), programa.substring(2, 3)).subscribe(
            tiposObs => {
              this.mensaje = tiposObs;
              if ("fail" != this.mensaje.status && "go" == this.mensaje.status) {
                if ("1" == tipo) {
                  if (!this.cookieService.get(environment.cookiePregrado)) {
                    var datos = {
                      doc: documento,
                      fac: {
                        codigo: programa,
                        inscripcion: this.programaSelected.inscripcion,
                        contacto: this.programaSelected.contacto,
                        correo: this.programaSelected.correo,
                        nombre: this.programaSelected.nombre,
                        fa: this.programaSelected.fa
                      }
                    };
                    this.cookieService.set(environment.cookiePregrado, JSON.stringify(datos), 15 / 1440, "/", environment.dominio);
                  }
                  setTimeout(function() {
                    this.document.location.href = environment.urlPregrado;
                  }, 5000);
                }
                if ("2" == tipo) {
                  if (!this.cookieService.get(environment.cookiePosgrado)) {
                    var datosPos = {
                      doc: documento,
                      fac: programa.substring(0, 2),
                      jor: programa.substring(2, 3)
                    };
                    this.cookieService.set(environment.cookiePosgrado, JSON.stringify(datosPos), 15 / 1440, "/", environment.dominio);
                  }
                  setTimeout(function() {
                    this.document.location.href = environment.urlPosgrado;
                  }, 5000);
                }
              } else {
                this.openMensajes(environment.titMensaje, this.mensaje.mensaje, 0);
              }
            },
            error => {}
          );
        }
      } else {
        setTimeout(function() {
          this.document.location.href = environment.urlDoctorados.replace("?1", programa.substring(0, 1)).replace("?2", documento);
        }, 5000);
      }
    }
  }
  //parametros
  public obtenerParametro(name: string) {
    const results = new RegExp("[?&]" + name + "=([^&#]*)").exec(window.location.href);
    if (!results) {
      return 0;
    }
    return results[1] || 0;
  }
}
//mensajes
@Component({
  selector: "ventanaDialogo",
  templateUrl: "ventanaMensajes.html",
  styleUrls: ["./pregrado.component.css"]
})
export class VentanaDialogoMensajesPreg {
  constructor(public dialogRef: MatDialogRef<VentanaDialogoMensajesPreg>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
