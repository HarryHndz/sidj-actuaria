<template>
  <div class="q-ma-sm">
    <q-table flat dense
      class="q-pb-sm q-mb-md"
      :data="anexosSort"
      :columns="columns"
      :hide-pagination="true"
    >
      <template v-slot:top-left>
        <div class="titulo">Anexos</div>
      </template>

      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="no" :props="props">
            {{ ++props.rowIndex }}
          </q-td>
          <q-td key="tipo_anexo" :props="props">
            {{ getTipoAnexo(props.row.tipoanexo_id) }}
          </q-td>
          <q-td key="tipo_documento" :props="props">
            {{ getTipoDocumento(props.row.tipodocumento_id) }}
          </q-td>
          <q-td key="fechaingreso" :props="props">
            {{ props.row.fechaingreso | moment('DD MMM YYYY') }}
          </q-td>
          <q-td key="cantidad" :props="props">
            {{ props.row.cantidad }}
          </q-td>
          <q-td key="copias" :props="props">
            {{ props.row.copias }}
          </q-td>

          <q-td key="accion" :props="props">

          </q-td>
        </q-tr>
        <q-tr v-for="documento in getDocumentosByAnexoId(props.row.anexo_id)"
          :key="documento.id"
        >
          <q-td> - </q-td>
          <q-td>{{documento.titulo}}</q-td>
          <q-td>{{getTipoDocumento(documento.tipo_documento_id)}}</q-td>
          <q-td>{{documento.fechaingreso | moment('DD MMM YYYY')}}</q-td>
          <q-td>{{documento.numeropaginas}}</q-td>
          <q-td>
            <span class="q-mx-sm cursor-pointer"
              @click.prevent="openModalPdf(documento)"
            >
              <q-icon name="visibility" color="black" size="1.5em"/>
              <q-tooltip>Visualizar</q-tooltip>
            </span>

            <span class="q-mx-sm cursor-pointer"
              @click.prevent="downloadDocumento(documento)"
            >
              <q-icon name="get_app" color="black" size="1.5em"/>
              <q-tooltip>Descargar</q-tooltip>
            </span>

            <span class="q-mx-sm cursor-pointer"
              @click.prevent="imprimirDocumento(documento)"
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
import printJS from 'print-js';

import errors from 'boot/errors';
import sidjbridge from 'boot/sidjbridge';

import { ModalPdfPaginador } from '@tjacdmx/sidj-components';

export default {
  name: 'tabla-anexos',
  props: {
    anexos: {
      type: Array,
      required: true,
    },
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
          name: 'tipo_anexo',
          label: 'Tipo de anexo',
          field: 'tipo_anexo',
          sortable: false,
          align: 'left',
          style: 'width: 28%',
        },
        {
          name: 'tipo_documento',
          label: 'Tipo de documento',
          field: 'tipo_documento',
          sortable: false,
          align: 'left',
          style: 'width: 24%',
        },
        {
          name: 'fechaingreso',
          label: 'Fecha de ingreso',
          field: 'fechaingreso',
          sortable: false,
          align: 'left',
          style: 'width: 23%',
        },
        {
          name: 'cantidad',
          label: 'Cantidad',
          field: 'cantidad',
          sortable: false,
          align: 'left',
          style: 'width: 12%',
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
    anexosSort() {
      return _.orderBy(this.anexos, ['created_at'], ['asc']);
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
    getDocumentosByAnexoId(id) {
      return this.$store.getters['documentos/getDocumentoByAnexoId'](id);
    },
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
