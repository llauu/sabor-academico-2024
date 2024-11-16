import Swal from 'sweetalert2';

export const sweetAlertConfig = Swal.mixin({
  customClass: {
    popup: 'sweet-popup',
    icon: 'sweet-icon',
    title: 'sweet-title',
    htmlContainer: 'sweet-text',
    confirmButton: 'sweet-confirm-button',
    cancelButton: 'sweet-cancel-button',
  },
  background: '#3b3b3b', // Fondo oscuro
  color: '#E0E0E0', // Texto claro
  buttonsStyling: false, // Desactiva estilos predeterminados de botones
});
