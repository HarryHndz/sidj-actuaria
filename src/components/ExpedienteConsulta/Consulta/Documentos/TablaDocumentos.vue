<template>
  <div class="q-ma-sm">
    <q-table flat dense
      class="q-pb-sm q-mb-md"
      :data="documentosSort"
      :columns="columns"
      :hide-pagination="true"
    >
      <template v-slot:top-left>
        <div class="titulo">Promociones</div>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="no" :props="props">
            {{ ++props.rowIndex }}
          </q-td>
          <q-td key="titulo" :props="props">
            {{ props.row.titulo }}
          </q-td>
          <q-td key="tipo_documento" :props="props">
            {{ getTipoDocumento(props.row.tipo_documento_id) }}
          </q-td>
          <q-td key="fechaingreso" :props="props">
            {{ props.row.fechaingreso | moment('DD MMM YYYY') }}
          </q-td>
          <q-td key="numeropaginas" :props="props">
            {{ props.row.numeropaginas }}
          </q-td>
          <q-td key="accion" :props="props">
            <span class="q-mx-sm cursor-pointer"
              @click.prevent="openModalPdf(props.row)"
            >
              <q-icon name="visibility" color="black" size="1.5em"/>
              <q-tooltip>Visualizar</q-tooltip>
            </span>

            <span class="q-mx-sm cursor-pointer"
              @click.prevent="downloadDocumento(props.row)"
            >
              <q-icon name="get_app" color="black" size="1.5em"/>
              <q-tooltip>Descargar</q-tooltip>
            </span>

            <span class="q-mx-sm cursor-pointer"
              @click.prevent="imprimirDocumento(props.row)"
            >
              <q-icon name="print" color="black" size="1.5em"/>
              <q-tooltip>Imprimir</q-tooltip>
            </span>
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <q-dialog
      full-height
      @hide="closeModalPdf"
      v-model="previsualizarPdf"
    >
      <modal-pdf-paginador
        v-if="previsualizarPdf"
        :base64="base64"
        :errorB64="errorB64"
        :documentoId="documentoId"
        :fetchingDocumento="fetchingDocumento"
        @changePage="changePage"
        @close="closeModalPdf"
      >
      </modal-pdf-paginador>
    </q-dialog>
  </div>
</template>

<script>
import {
  QTd,
  QTr,
  QTable,
  Loading,
} from 'quasar';

import _ from 'lodash';

import sidjbridge from 'boot/sidjbridge';
import errors from 'boot/errors';

import { ModalPdfPaginador } from '@tjacdmx/sidj-components';
import printJS from 'print-js';

export default {
  name: 'tabla-documentos',
  props: {
    documentos: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      object: null,
      showForm: false,
      isMobile: this.$q.screen.width < 600,
      base64: null,
      errorB64: null,
      documentoId: null,
      previsualizarPdf: null,
      fetchingDocumento: null,

      columns: [
        {
          name: 'no',
          label: 'No',
          field: 'no',
          sortable: false,
          align: 'left',
          style: 'width: 2%',
        },
        {
          name: 'titulo',
          label: 'Titulo',
          field: 'titulo',
          sortable: false,
          align: 'left',
          style: 'width: 24%',
        },
        {
          name: 'tipo_documento',
          label: 'Tipo de documento',
          field: 'tipo_documento',
          sortable: false,
          align: 'left',
          style: 'width: 22%',
        },
        {
          name: 'fechaingreso',
          label: 'Fecha de ingreso',
          field: 'fechaingreso',
          sortable: false,
          align: 'left',
          style: 'width: 21%',
        },
        {
          name: 'numeropaginas',
          label: 'Cantidad',
          field: 'numeropaginas',
          sortable: false,
          align: 'left',
          style: 'width: 10%',
        },
        {
          name: 'accion',
          label: '',
          field: 'accion',
          sortable: false,
          align: 'center',
          style: 'width: 11%',
        },
      ],
    };
  },
  components: {
    QTd,
    QTr,
    QTable,
    ModalPdfPaginador,
  },
  computed: {
    documentosSort() {
      return _.orderBy(this.documentos, ['created_at'], ['asc']);
    },
    tiposAnexos() {
      return this.$store.getters['tiposAnexos/getTiposAnexosAll'].map(i => ({
        label: i.descripcion,
        value: i.tipo_anexo_id,
      }));
    },
    tiposDocumentos() {
      return this.$store.getters['tiposDocumentos/getTiposDocumentosAll'].map(i => ({
        label: i.descripcion,
        value: i.tipo_documento_id,
      }));
    },
  },
  methods: {
    getTipoAnexo(id) {
      const tipo = this.tiposAnexos.find(i => i.value === id);
      return tipo ? tipo.label : '--';
    },
    getTipoDocumento(id) {
      const tipo = this.tiposDocumentos.find(i => i.value === id);
      return tipo ? tipo.label : '--';
    },
    closeModalPdf() {
      this.base64 = null;
      this.documentoId = null;
      this.previsualizarPdf = false;
      this.fetchingDocumento = false;
    },
    async downloadDocumento(object) {
      try {
        Loading.show({
          message: 'Cargando...',
        });
        const response = await sidjbridge.get(`descargas/documentosB64/${object.id}`);
        const linkSource = `data:application/pdf;base64,${response.data}`;
        const downloadLink = document.createElement('a');

        downloadLink.href = linkSource;
        downloadLink.download = object.nombrearchivo;
        downloadLink.click();
      } catch (err) {
        errors(err);
      } finally {
        Loading.hide();
      }
    },
    async changePage(document) {
      try {
        this.fetchingDocumento = true;

        const response = await this.$store.dispatch('pagination/getPaginationDocumentosPdf', {
          id: document.id,
          page: document.page,
          nombreDocumento: document.nombreDocumento,
        });

        this.base64 = response.base64;
      } catch (err) {
        errors(err);
        this.documentoId = null;
        this.base64 = null;
        this.errorB64 = err.data;
      } finally {
        this.fetchingDocumento = false;
      }
    },
    async openModalPdf(documento, page = 1) {
      this.previsualizarPdf = true;
      this.documentoId = documento.id;

      return this.changePage({
        page,
        id: documento.id,
        nombreDocumento: documento.nombrearchivo,
      });
    },
    async imprimirDocumento(object) {
      try {
        Loading.show({
          message: 'Cargando...',
        });

        const response = await sidjbridge.get(`/descargas/documentosB64/${object.id}`);

        if (response.data) {
          printJS({ printable: response.data, type: 'pdf', base64: true });
        } else {
          this.$swal({
            icon: 'error',
            title: 'Error',
            text: 'Archivo no encontrado',
          });
        }
      } catch (err) {
        errors(err);
      } finally {
        Loading.hide();
      }
    },
  },
};
</script>
