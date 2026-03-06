export interface DetalleVentaDto {
  idDetalleVenta?: number;
  idVenta?: number;
  idDetalleIngreso: number;
  cantidad: number;
  precioVenta: number;
  descuento: number;
  articuloNombre?: string;
}

export interface VentaConDetallesDto {
  idCliente: number;
  idTrabajador: number;
  fecha: string;
  tipoComprobante: string;
  serie: string;
  correlativo: string;
  igv: number;
  detalles: DetalleVentaDto[];
}

export interface VentaDto extends VentaConDetallesDto {
  idVenta: number;
  clienteNombre: string;
  trabajadorNombre: string;
  
  expanded?: boolean;
}
