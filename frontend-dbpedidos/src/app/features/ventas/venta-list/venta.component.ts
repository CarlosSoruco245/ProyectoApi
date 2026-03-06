import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';

import { VentaService } from '../../../core/services/venta.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { TrabajadorService } from '../../../core/services/trabajador.service';
import { DetalleIngresoService } from '../../../core/services/detalle-ingreso.service';

import { ClienteDto } from '../../../core/services/cliente.service';
import { TrabajadorDto } from '../../../core/services/trabajador.service';
import { DetalleIngresoDto } from '../../../core/models/detalle-ingreso.model';
import { VentaDto, VentaConDetallesDto } from '../../../core/models/venta.model';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-venta',
  standalone: true,
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class VentaComponent implements OnInit {
  form!: FormGroup;
  ventas: VentaDto[] = [];
  ventasFiltradasPaginadas: VentaDto[] = [];

  clientes: ClienteDto[] = [];
  trabajadores: TrabajadorDto[] = [];
  detallesIngreso: DetalleIngresoDto[] = [];

  detalles: VentaConDetallesDto['detalles'] = [];
  idVentaEditando: number | null = null;
  mostrarFormulario = false;

  // Paginación y orden
  filtro = '';
  campoOrdenamiento: keyof VentaDto = 'idVenta';
  ordenAscendente = true;
  paginaActual = 1;
  cantidadPorPagina = 5;

  constructor(
    private fb: FormBuilder,
    private ventaService: VentaService,
    private clienteService: ClienteService,
    private trabajadorService: TrabajadorService,
    private detalleIngresoService: DetalleIngresoService
  ) {}

  async ngOnInit() {
    this.form = this.fb.group({
      idCliente: [null, Validators.required],
      idTrabajador: [null, Validators.required],
      fecha: [new Date().toISOString().substring(0, 10), Validators.required],
      tipoComprobante: ['Boleta', Validators.required],
      serie: ['0001', Validators.required],
      correlativo: ['0000001', Validators.required],
      igv: [18, Validators.required]
    });

    await Promise.all([
      this.cargarVentas(),
      this.cargarClientes(),
      this.cargarTrabajadores(),
      this.cargarDetallesIngreso()
    ]);
  }

  async cargarVentas() {
    this.ventas = await this.ventaService.getAll();
    this.actualizarVista();
  }

  actualizarVista() {
    const filtradas = this.ventas.filter(v =>
      v.clienteNombre.toLowerCase().includes(this.filtro.toLowerCase()) ||
      v.trabajadorNombre.toLowerCase().includes(this.filtro.toLowerCase())
    );

    filtradas.sort((a, b) => {
  const valA = a[this.campoOrdenamiento] ?? '';
  const valB = b[this.campoOrdenamiento] ?? '';

  if (typeof valA === 'number' && typeof valB === 'number') {
    return this.ordenAscendente ? valA - valB : valB - valA;
  }

  return this.ordenAscendente
    ? valA.toString().localeCompare(valB.toString())
    : valB.toString().localeCompare(valA.toString());
});


    const inicio = (this.paginaActual - 1) * this.cantidadPorPagina;
    this.ventasFiltradasPaginadas = filtradas.slice(inicio, inicio + this.cantidadPorPagina);
  }

  cambiarOrden(campo: keyof VentaDto) {
    if (this.campoOrdenamiento === campo) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.campoOrdenamiento = campo;
      this.ordenAscendente = true;
    }
    this.actualizarVista();
  }

  cambiarPagina(pagina: number) {
    this.paginaActual = pagina;
    this.actualizarVista();
  }

  actualizarCantidadPorPagina(n: number) {
    this.cantidadPorPagina = n;
    this.paginaActual = 1;
    this.actualizarVista();
  }

  async cargarClientes() {
    this.clientes = await this.clienteService.getAll();
  }

  async cargarTrabajadores() {
    this.trabajadores = await this.trabajadorService.getAll();
  }

  async cargarDetallesIngreso() {
    this.detallesIngreso = await this.detalleIngresoService.getAll();
  }

  agregarDetalle() {
    this.detalles.push({ idDetalleIngreso: 0, cantidad: 1, precioVenta: 0, descuento: 0 });
  }

  eliminarDetalle(i: number) {
    this.detalles.splice(i, 1);
  }

  async submit() {
    if (this.form.invalid || this.detalles.length === 0) {
      Swal.fire('Error', 'Completa todos los campos y agrega al menos un detalle.', 'error');
      return;
    }

    const dto: VentaConDetallesDto = {
      ...this.form.value,
      detalles: this.detalles
    };

    try {
      if (this.idVentaEditando) {
        await this.ventaService.update(this.idVentaEditando, dto);
        Swal.fire('Actualizado', 'La venta fue actualizada correctamente.', 'success');
      } else {
        await this.ventaService.createVentaConDetalles(dto);
        Swal.fire('Registrado', 'La venta fue registrada correctamente.', 'success');
      }

      this.cancelarEdicion();
      await this.cargarVentas();
    } catch (err) {
      Swal.fire('Error', 'Ocurrió un error al guardar la venta.', 'error');
    }
  }

  editarVenta(v: VentaDto) {
    this.idVentaEditando = v.idVenta;
    this.mostrarFormulario = true;

    const fechaFormateada = new Date(v.fecha).toISOString().split('T')[0];

    this.form.patchValue({
      idCliente: v.idCliente,
      idTrabajador: v.idTrabajador,
      fecha: fechaFormateada,
      tipoComprobante: v.tipoComprobante,
      serie: v.serie,
      correlativo: v.correlativo,
      igv: v.igv
    });

    this.detalles = v.detalles.map(d => ({
      idDetalleIngreso: d.idDetalleIngreso,
      cantidad: d.cantidad,
      precioVenta: d.precioVenta,
      descuento: d.descuento
    }));
  }

  cancelarEdicion() {
    this.idVentaEditando = null;
    this.mostrarFormulario = false;
    this.form.reset({
      tipoComprobante: 'Boleta',
      serie: '0001',
      correlativo: '0000001',
      igv: 18,
      fecha: new Date().toISOString().substring(0, 10)
    });
    this.detalles = [];
  }

  async eliminarVenta(id: number) {
    const result = await Swal.fire({
      title: '¿Eliminar venta?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await this.ventaService.delete(id);
        await this.cargarVentas();
        Swal.fire('Eliminado', 'La venta fue eliminada correctamente.', 'success');
      } catch {
        Swal.fire('Error', 'No se pudo eliminar la venta.', 'error');
      }
    }
  }
}
