import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ProveedorService, ProveedorDto } from '../../../core/services/proveedor.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-proveedor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './proveedor.component.html',
  styleUrls: ['./proveedor.component.scss']
})
export class ProveedorComponent implements OnInit {
  proveedores: ProveedorDto[] = [];
  form!: FormGroup;
  cargando = true;
  error = '';
  editandoId: number | null = null;

  filtro = '';
  mostrarFormulario = false;

  // Paginación
  proveedoresPorPagina = 5;
  paginaActual = 1;

  // Ordenamiento
  ordenColumna: keyof ProveedorDto | '' = '';
  ordenAscendente = true;

  constructor(
    private proveedorService: ProveedorService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.inicializarFormulario();
    this.cargarProveedores();
  }

  inicializarFormulario() {
    this.form = this.fb.group({
      razonSocial: ['', [Validators.required, Validators.maxLength(100)]],
      sectorComercial: ['', Validators.maxLength(50)],
      tipoDocumento: ['RUC', Validators.required],
      numDocumento: ['', [Validators.required, Validators.maxLength(20)]],
      direccion: ['', Validators.maxLength(200)],
      telefono: ['', [Validators.pattern(/^[0-9]+$/), Validators.maxLength(20)]],
      email: ['', [Validators.email, Validators.maxLength(100)]]
    });
  }

  async cargarProveedores() {
    this.cargando = true;
    this.error = '';
    
    try {
      this.proveedores = await this.proveedorService.getAll();
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      this.error = this.obtenerMensajeError(error);
      Swal.fire('Error', this.error, 'error');
    } finally {
      this.cargando = false;
    }
  }

  async submit() {
    if (this.form.invalid) {
      this.marcarControlesComoTocados();
      return;
    }

    this.cargando = true;
    const datos = this.form.value;

    try {
      console.log('Datos a enviar:', datos); // Para depuración

      if (this.editandoId === null) {
        await this.proveedorService.create(datos);
        Swal.fire('¡Registrado!', 'Proveedor registrado exitosamente.', 'success');
      } else {
        await this.proveedorService.update(this.editandoId, { 
          ...datos, 
          idProveedor: this.editandoId 
        });
        Swal.fire('¡Actualizado!', 'Proveedor actualizado correctamente.', 'success');
      }

      await this.cargarProveedores();
      this.cancelar();
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
      const mensajeError = this.obtenerMensajeError(error);
      Swal.fire('Error', mensajeError, 'error');
    } finally {
      this.cargando = false;
    }
  }

  marcarControlesComoTocados() {
    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  obtenerMensajeError(error: any): string {
    if (error?.error?.errors) {
      // Manejo de errores de validación del servidor
      return Object.values(error.error.errors).join('\n');
    }
    return error?.error?.message || error?.message || 'Ocurrió un error inesperado';
  }

  editar(proveedor: ProveedorDto) {
    this.editandoId = proveedor.idProveedor;
    this.form.patchValue(proveedor);
    this.mostrarFormulario = true;
  }

  cancelar() {
    this.form.reset({ tipoDocumento: 'RUC' });
    this.editandoId = null;
    this.mostrarFormulario = false;
    this.form.markAsUntouched();
  }

  async eliminar(id: number) {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    });

    if (!result.isConfirmed) return;

    this.cargando = true;
    try {
      await this.proveedorService.delete(id);
      await this.cargarProveedores();
      Swal.fire('¡Eliminado!', 'Proveedor eliminado correctamente.', 'success');
    } catch (error) {
      console.error('Error al eliminar proveedor:', error);
      Swal.fire('Error', this.obtenerMensajeError(error), 'error');
    } finally {
      this.cargando = false;
    }
  }

  // Ordenamiento
  ordenarPor(columna: keyof ProveedorDto) {
    if (this.ordenColumna === columna) {
      this.ordenAscendente = !this.ordenAscendente;
    } else {
      this.ordenColumna = columna;
      this.ordenAscendente = true;
    }
  }

  // Filtro
  get proveedoresFiltrados(): ProveedorDto[] {
    const f = this.filtro.trim().toLowerCase();
    if (!f) return this.proveedores;

    return this.proveedores.filter(p =>
      p.razonSocial.toLowerCase().includes(f) ||
      (p.sectorComercial?.toLowerCase()?.includes(f) ?? false) ||
      p.tipoDocumento.toLowerCase().includes(f) ||
      (p.numDocumento?.toLowerCase()?.includes(f) ?? false) ||
      (p.direccion?.toLowerCase()?.includes(f) ?? false) ||
      (p.telefono?.toLowerCase()?.includes(f) ?? false) ||
      (p.email?.toLowerCase()?.includes(f) ?? false)
    );
  }

  // Ordenados
  get proveedoresOrdenados(): ProveedorDto[] {
    const lista = [...this.proveedoresFiltrados];
    if (this.ordenColumna) {
      const columna = this.ordenColumna as keyof ProveedorDto;
      lista.sort((a, b) => {
        const valA = (a[columna] ?? '').toString().toLowerCase();
        const valB = (b[columna] ?? '').toString().toLowerCase();
        return this.ordenAscendente
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      });
    }
    return lista;
  }

  // Paginados
  get proveedoresPaginados(): ProveedorDto[] {
    const inicio = (this.paginaActual - 1) * this.proveedoresPorPagina;
    return this.proveedoresOrdenados.slice(inicio, inicio + this.proveedoresPorPagina);
  }

  get totalPaginas(): number {
    return Math.ceil(this.proveedoresOrdenados.length / this.proveedoresPorPagina);
  }

  cambiarPagina(delta: number) {
    const nuevaPagina = this.paginaActual + delta;
    if (nuevaPagina > 0 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
    }
  }
}