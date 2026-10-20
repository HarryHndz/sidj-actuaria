<template>
  <div class="q-pa-md">
    <div class="q-pa-sm q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Inicio" icon="home" to="/" />
        <q-breadcrumbs-el label="Busqueda" icon="search"/>
      </q-breadcrumbs>
    </div>

    <div class="q-mb-sm text-center titulo">
      <strong>LISTA DE ESTRADOS v{{env.VERSION_ESTRADOS_BOLETIN}}</strong>
    </div>

    <q-tabs
      dense
      v-model="tab"
      class="text-teal q-mb-lg"
    >
      <q-route-tab name="consulta"
        icon="search"
        label="Consulta"
        class="text-black"
        :to="{name: 'busqueda-listado-acuerdo'}"
      />
      <q-route-tab name="generacion"
        icon="input"
        label="Generación"
        class="text-black"
        :to="{name: 'generacion-listado'}"
      />
    </q-tabs>

    <div class="q-gutter-y-sm">
      <div class="SIDJ-box">
        <div class="row">
          <div class="col-md-12">
            <label class="q-ma-md" for="no_folio">Búsqueda</label>
            <q-input outlined
              autofocus
              stack-label
              autocomplete="off"
              name="no_folio"
              label="No. folio listado, No. folio acuerdo, No. Juicio"
              class="q-ma-md"
              v-model="filtros.folio"
              v-on:keyup.enter="busqueda"
            />
          </div>

          <template v-if="busqueda_avanzada">
            <div class="col-md-6">
              <q-input outlined
                stack-label
                class="q-ma-md"
                mask="####-##-##"
                autocomplete="off"
                name="fecha_inicio"
                label="Fecha de inicio"
                v-on:keyup.enter="busqueda"
                v-model="filtros.fecha_inicio"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="qDateInicial"
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="filtros.fecha_inicio"
                        color="pink-10"
                        @input="() => $refs.qDateInicial.hide()"
                      />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <div class="col-md-6">
              <q-input outlined
                stack-label
                class="q-ma-md"
                mask="####-##-##"
                autocomplete="off"
                name="Fecha final"
                label="Fecha final"
                v-on:keyup.enter="busqueda"
                v-model="filtros.fecha_fin"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="qDateFinal"
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="filtros.fecha_fin"
                        color="pink-10"
                        @input="() => $refs.qDateFinal.hide()"
                      />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <div class="col-md-6">
              <q-select
                stack-label
                outlined
                use-input
                clearable
                id="sala"
                class="q-ma-md"
                label="Sala"
                :options="sFiltered"
                v-model="salaObject"
                @filter="filterSalaFn"
              />
            </div>

            <div class="col-md-6">
              <q-select
                outlined
                use-input
                clearable
                stack-label
                id="ponencia"
                class="q-ma-md"
                label="Ponencia"
                :options="pFiltered"
                v-model="ponenciaObject"
                @filter="filterPonenciaFn"
              />
            </div>

            <div class="col-md-6">
              <q-select
                outlined
                clearable
                emit-value
                stack-label
                map-options
                id="estatus"
                class="q-ma-md"
                label="Estatus"
                :options="estatus"
                v-model="filtros.estatus"
              />
            </div>

            <div class="col-md-6" v-if="[1, 9].some(i => permisos.some(j => i === j))">
              <q-select
                outlined
                clearable
                stack-label
                class="q-ma-md"
                id="tipoListado"
                v-model="tipoListadoObject"
                label="Tipos de listados"
                :options="tiposListados"
              />
            </div>
          </template>
        </div>

        <div class="row">
          <div class="col-md-6">
            <q-btn class="q-my-sm q-mx-md"
              color="warning"
              icon="search"
              label="Buscar"
              :loading="fetching"
              @click="busqueda"
            />
          </div>
          <div class="col-md-6">
            <div class="col-md-6" align="right">
              <q-btn class="q-my-sm q-mx-md"
                color="warning"
                :icon="!busqueda_avanzada ? 'expand_more' : 'expand_less'"
                @click.prevent="busqueda_avanzada = !busqueda_avanzada"
              />
            </div>
          </div>
        </div>
      </div>

      <q-separator style="margin:30px 5px;"/>

      <div class="x_content text-center" v-if="fetching">
        <q-spinner
          color="black"
          size="4em"
          :thickness="5"
        />
      </div>

      <contenedor-listados
        v-if="!fetching && resultados.length > 0"
        :resultados="resultados"
      >
      </contenedor-listados>

      <template v-if="resultados.length == 0 && !fetching">
        <div class="x_content">
          <h6 class="text-center">No se encontraron resultados</h6>
        </div>
      </template>

      <div  v-if="pagination.total > 10 && !fetching"
        class="q-pa-lg flex flex-center"
      >
        <q-pagination
          v-model="filtros.page"
          color="pink-10"
          :min="1"
          :max="pagination.total_pages"
          :max-pages="6"
          :direction-links="true"
          @input="busquedaPaginacion"
        >
        </q-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import {
  QTabs,
  QDate,
  QInput,
  Loading,
  QSelect,
  QSpinner,
  QRouteTab,
  QSeparator,
  QPagination,
  QPopupProxy,
  QBreadcrumbs,
  QSpinnerGears,
  QBreadcrumbsEl,
} from 'quasar';

import _ from 'lodash';
import axios from 'axios';
import env from 'boot/env';
import errors from 'boot/errors';

import ContenedorListados from 'components/ListaEstrados/Busqueda/ContenedorListados';

export default {
  name: 'busqueda-listado',
  data() {
    return {
      tab: 'consulta',
      fetching: false,
      salaObject: null,
      ponenciaObject: null,
      tipoListadoObject: null,
      busqueda_avanzada: false,
      pFiltered: this.ponencias,
      sFiltered: this.salas,
      filtros: {
        page: 1,
        limit: 10,
        folio: null,
        estatus: null,
        sala_id: null,
        fecha_fin: null,
        no_juicio: null,
        no_exhorto: null,
        pendientes: null,
        ponencia_id: null,
        fecha_inicio: null,
        folio_acuerdo: null,
        no_consignacion: null,
        tipo_listado_id: null,
        orderByDesc: 'fecha_publicacion',
      },
    };
  },
  async preFetch({ store }) {
    Loading.show({
      spinner: QSpinnerGears,
      backgroundColor: 'pink-8',
    });
    try {
      await axios.all([
        store.dispatch('actuarios/fetchAllActuarios', {
          limit: -1,
        }),
        store.dispatch('ponencias/fetchAllPonencias', {
          limit: -1,
        }),
        store.dispatch('salas/fetchAllSalas', {
          limit: -1,
        }),
        store.dispatch('tiposLeyendas/fetchAllTiposLeyendas', {
          limit: -1,
        }),
        store.dispatch('tiposListados/fetchAllTiposListados', {
          limit: -1,
        }),
      ]);
    } catch (error) {
      errors(error);
    } finally {
      Loading.hide();
    }
  },
  async beforeMount() {
    this.$emit('leftDrawerOpen', false);

    this.fetching = true;
    this.filtros.pendientes = 1;
    try {
      await this.$store.dispatch('listadosAcuerdos/fetchAllListadosAcuerdos', this.filtros);
    } catch (e) {
      errors(e);
    } finally {
      this.fetching = false;
    }
  },
  components: {
    QTabs,
    QDate,
    QInput,
    QSelect,
    QSpinner,
    QRouteTab,
    QSeparator,
    QPagination,
    QPopupProxy,
    QBreadcrumbs,
    QBreadcrumbsEl,
    ContenedorListados,
  },
  computed: {
    env() {
      return env;
    },
    estatus() {
      return [
        {
          label: 'TODOS',
          value: 0,
        },
        {
          label: 'PENDIENTES POR PUBLICAR',
          value: 1,
        },
        {
          label: 'PUBLICADOS',
          value: 2,
        },
      ];
    },
    salas() {
      const salas = this.$store.getters['salas/getSalasAll'].map(item => ({
        label: item.sala,
        value: item.sala_id,
      }));
      return _.orderBy(salas, ['value', 'label'], ['asc', 'asc']);
    },
    tiposListados() {
      const tipos = this.$store.getters['tiposListados/getTiposListadosAll'].map(item => ({
        label: item.descripcion,
        value: item.tipo_listado_id,
      }));
      return _.orderBy(tipos, ['value', 'label'], ['asc', 'asc']);
    },
    permisos() {
      return this.$store.getters['session/getRolesById'];
    },
    ponencias() {
      let ponencias = this.$store.getters['ponencias/getPonenciasAll'].map(item => ({
        label: `${item.clave} ${item.ponencia}`,
        value: item.ponencia_id,
        sala_id: item.sala_id,
      }));

      if (this.filtros.sala_id) {
        ponencias = ponencias.filter(item => item.sala_id === this.filtros.sala_id);
      }

      return _.orderBy(ponencias, ['value', 'label'], ['asc', 'asc']);
    },
    pagination() {
      return this.$store.getters['listadosAcuerdos/getListadosAcuerdosPagination'];
    },
    resultados() {
      return this.$store.getters['listadosAcuerdos/getListadosAcuerdosVisibles'];
    },
  },
  methods: {
    filterSalaFn(val, update) {
      update(() => {
        const needle = val.toLowerCase();
        this.sFiltered = this.salas.filter(v => v.label.toLowerCase().indexOf(needle) > -1);
      });
    },
    filterPonenciaFn(val, update) {
      update(() => {
        const needle = val.toLowerCase();
        this.pFiltered = this.ponencias.filter(v => v.label.toLowerCase().indexOf(needle) > -1);
      });
    },
    async busqueda() {
      this.fetching = true;

      const filterNoJuicio = /^((TJA|TJ|TE)(-|\/))?((X{0,3})?(IX|IV|V?I{0,3}))?(-)(\d{1,5})?(0?[0-9]{2})(\/\d{4})?|^TJA-\d{3,8}(\/\d{4}(-[A-Z0-9]{2,4})?)?$/;
      const filterNoConsignacion = /^(CNS-)(\d{1,6})(\/(\d{4}))/;
      const filterNoExhorto = /^(EXH-)(\d{1,6})(\/(\d{4}))/;
      const filterFolioAcuerdo = /^(A|PA)(-)(\d{1,6})(-)(\d{4})/;
      const filterFolioListado = /^(SO|SS|SE|SGAI|SGAII|SGA)(\d{2})?(-\d{1,6})(\/\d{4})/;

      this.filtros.page = 1;
      this.filtros.pendientes = null;

      if (filterFolioListado.exec(this.filtros.folio) !== null) {
        this.filtros.folio = this.filtros.folio;
        this.filtros.folio_acuerdo = null;
        this.filtros.no_juicio = null;
        this.filtros.no_consignacion = null;
        this.filtros.no_exhorto = null;
      }

      if (filterFolioAcuerdo.exec(this.filtros.folio) !== null) {
        this.filtros.folio_acuerdo = this.filtros.folio;
        this.filtros.folio = null;
        this.filtros.no_juicio = null;
        this.filtros.no_consignacion = null;
        this.filtros.no_exhorto = null;
      }

      if (filterNoJuicio.exec(this.filtros.folio) !== null) {
        this.filtros.no_juicio = this.filtros.folio;
        this.filtros.folio_acuerdo = null;
        this.filtros.folio = null;
        this.filtros.no_consignacion = null;
        this.filtros.no_exhorto = null;
      }

      if (filterNoConsignacion.exec(this.filtros.folio) !== null) {
        this.filtros.no_consignacion = this.filtros.folio;
        this.filtros.folio_acuerdo = null;
        this.filtros.folio = null;
        this.filtros.no_juicio = null;
        this.filtros.no_exhorto = null;
      }

      if (filterNoExhorto.exec(this.filtros.folio) !== null) {
        this.filtros.no_exhorto = this.filtros.folio;
        this.filtros.folio_acuerdo = null;
        this.filtros.folio = null;
        this.filtros.no_consignacion = null;
        this.filtros.no_juicio = null;
      }

      await this.$store.dispatch('listadosAcuerdos/fetchAllListadosAcuerdos', this.filtros);

      if (this.pagination.total === 0) {
        this.fetching = false;
        return Promise.resolve(true);
      }

      if (this.pagination.total === 1) {
        this.fetching = false;
        this.$router.push({
          name: 'listado-acuerdo',
          params: {
            uuid: this.resultados[0].id,
          },
        });
      }

      this.fetching = false;
      return Promise.resolve(true);
    },
    async busquedaPaginacion(page) {
      this.fetching = true;

      if (!Number.isInteger(page)) {
        page = 1;
      }

      const filterNoJuicio = /^((TJA|TJ|TE)(-|\/))?((X{0,3})?(IX|IV|V?I{0,3}))?(-)(\d{1,5})?(0?[0-9]{2})(\/\d{4})?|^TJA-\d{3,8}(\/\d{4}(-[A-Z0-9]{2,4})?)?$/;
      const filterFolioAcuerdo = /^(A-|PA-)(\d{1,6})(-\d{4})/;
      const filterFolioListado = /^(SO|SS|SE|SGAI|SGAII|SGA)(\d{2})?(-\d{1,6})(\/\d{4})/;

      this.filtros.pendientes = null;

      if (filterFolioListado.exec(this.filtros.folio) !== null) {
        this.filtros.folio = this.filtros.folio;
        this.filtros.folio_acuerdo = null;
        this.filtros.no_juicio = null;
      }

      if (filterFolioAcuerdo.exec(this.filtros.folio) !== null) {
        this.filtros.folio_acuerdo = this.filtros.folio;
        this.filtros.folio = null;
        this.filtros.no_juicio = null;
      }

      if (filterNoJuicio.exec(this.filtros.folio) !== null) {
        this.filtros.no_juicio = this.filtros.folio;
        this.filtros.folio_acuerdo = null;
        this.filtros.folio = null;
      }

      await this.$store.dispatch('listadosAcuerdos/fetchAllListadosAcuerdos', {
        ...this.filtros,
        page,
      });

      if (this.pagination.total === 0) {
        this.fetching = false;
        return Promise.resolve(true);
      }

      if (this.pagination.total === 1) {
        this.fetching = false;

        this.$router.push({
          name: 'listado-acuerdo',
          params: {
            uuid: this.resultados[0].id,
          },
        });
      }

      this.fetching = false;
      return Promise.resolve(true);
    },
  },
  watch: {
    'filtros.folio': {
      handler(val) {
        if (val === '') {
          this.filtros.page = 1;
          this.filtros.folio = null;
        }
      },
      deep: true,
    },
    salaObject(val) {
      /* eslint no-unused-expressions: [2, { allowTernary: true }] */
      val != null ? this.filtros.sala_id = val.value : this.filtros.sala_id = null;
    },
    ponenciaObject(val) {
      /* eslint no-unused-expressions: [2, { allowTernary: true }] */
      val != null ? this.filtros.ponencia_id = val.value : this.filtros.ponencia_id = null;
    },
    tipoListadoObject(val) {
      /* eslint no-unused-expressions: [2, { allowTernary: true }] */
      val != null ? this.filtros.tipo_listado_id = val.value : this.filtros.tipo_listado_id = null;
    },
  },
};
</script>

<style scoped>
  .SIDJ-box {
    background: rgba(42, 63, 84, 0.04);
    margin: 5px;
    padding: 5px;
    background-color: #fff;
  }

  .SIDJ-box label{
    font-size: 16px;
    font-weight: 700;
  }
</style>
