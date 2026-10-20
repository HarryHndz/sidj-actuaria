<template>
  <div class="q-pa-md">
    <div class="q-pa-sm q-gutter-sm">
      <q-breadcrumbs>
        <q-breadcrumbs-el label="Inicio" icon="home" to="/" />
        <q-breadcrumbs-el label="Búsqueda" icon="search"/>
      </q-breadcrumbs>
    </div>

    <div class="q-gutter-y-sm">
      <div class="q-mb-sm text-center titulo">
        <strong>NOTIFICACIONES v{{env.VERSION_NOTIFICACIONES}}</strong>
      </div>

      <div class="SIDJ-box">
        <div class="row">
          <div class="col-md-12">
            <label class="q-ma-sm" for="query">Búsqueda</label>
            <q-input outlined
              autofocus
              stack-label
              ref="query"
              name="query"
              autocomplete="off"
              class="q-ma-sm"
              v-model="filtros.query"
              v-on:keyup.enter="busqueda"
              label="No juicio, No folio promoción, No folio acuerdo"
            />
            <q-btn class="q-ma-sm q-mt-md"
              color="warning"
              icon="search"
              label="Buscar"
              :loading="fetching"
              @click.prevent="busqueda"
            />
          </div>
        </div>
      </div>

      <q-separator class="q-my-lg"/>

      <div class="x_content text-center" v-if="fetching">
        <q-spinner
          color="black"
          size="4em"
          :thickness="5"
        />
      </div>

      <tabla-acuerdos v-if="!fetching && resultados.length > 0"
        :resultados="resultados"
      />

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
          @input="busqueda"
        >
        </q-pagination>
      </div>
    </div>
  </div>
</template>

<script>
import {
  QInput,
  Loading,
  QSpinner,
  QSeparator,
  QPagination,
  QBreadcrumbs,
  QSpinnerGears,
  QBreadcrumbsEl,
} from 'quasar';

import axios from 'axios';

import env from 'boot/env';
import errors from 'boot/errors';

import TablaAcuerdos from 'components/Notificaciones/Busqueda/TablaAcuerdos';

import 'src/css/SIDJ-style.css';

const sweetAlertConfig = {
  type: 'success',
  showCancelButton: false,
  confirmButtonColor: '#3085d6',
  confirmButtonText: 'Ok',
};

export default {
  name: 'busqueda',
  data() {
    return {
      fetching: false,
      filtros: {
        page: 1,
        limit: 10,
        query: null,
        no_juicio: null,
        acuerdo_folio: null,
        actuacion_folio: null,
        orderBy: 'fechaingresotca',
        includes: ['actores', 'autoridades', 'terceros'],
      },
    };
  },
  components: {
    QInput,
    QSpinner,
    QSeparator,
    QPagination,
    QBreadcrumbs,
    QBreadcrumbsEl,
    TablaAcuerdos,
  },
  async preFetch({ store }) {
    Loading.show({
      spinner: QSpinnerGears,
      backgroundColor: 'pink-8',
    });
    try {
      await axios.all([
        store.dispatch('materias/fetchAllMaterias', {
          limit: -1,
          cache: true,
        }),
        store.dispatch('procesos/fetchAllProcesos', {
          limit: -1,
        }),
        store.dispatch('ponencias/fetchAllPonencias', {
          limit: -1,
        }),
        store.dispatch('salas/fetchAllSalas', {
          limit: -1,
        }),
        store.dispatch('promoventes/fetchAllPromoventes', {
          limit: -1,
        }),
        store.dispatch('tiposDemandas/fetchAllTiposDemandas', {
          limit: -1,
        }),
        store.dispatch('tiposJuicios/fetchAllTiposJuicios', {
          limit: -1,
        }),
        store.dispatch('tiposNotificaciones/fetchAllTiposNotificaciones', {
          limit: -1,
        }),
      ]);
    } catch (e) {
      errors(e);
    } finally {
      Loading.hide();
    }
  },
  beforeMount() {
    this.$emit('leftDrawerOpen', false);

    this.$nextTick(() => {
      this.$refs.query.focus();
    });
  },
  computed: {
    env() {
      return env;
    },
    resultados() {
      let resultados = this.$store.getters['expedientesElectronicos/getExpedientesElectronicoVisibles'];

      resultados = resultados.map((i) => {
        const notificaciones = [];
        this.notificaciones.forEach((j) => {
          if (i.acuerdo_id === j.acuerdo_id) {
            notificaciones.push(j);
            i.notificaciones = notificaciones;
          }
        });
        return {
          ...i,
          notificaciones,
        };
      });

      return resultados;
    },
    notificaciones() {
      return this.$store.getters['notificaciones/getNotificacionesAll'];
    },
    pagination() {
      return this.$store.getters['expedientesElectronicos/getExpedientesElectronicoPagination'];
    },
  },
  methods: {
    async busqueda(page) {
      this.fetching = true;
      if (this.filtros.query === null || this.filtros.query === '') {
        this.fetching = false;
        return Promise.resolve(true);
      }

      if (!Number.isInteger(page)) {
        page = 1;
      }

      const filterNoJuicio = /^((TJA|TJ|TE)(-|\/))?((X{0,3})?(IX|IV|V?I{0,3}))?(-)(\d{1,5})?(0?[0-9]{2})(\/\d{4})?|^TJA-\d{3,8}(\/\d{4}(-[A-Z0-9]{2,4})?)?$/;
      const filterFolioAcuerdo = /^(A|PA)(-)(\d{6})(-)(\d{4})?/;
      const filterFolioActuacion = /^\d{5,10}$/;

      if (filterNoJuicio.exec(this.filtros.query) !== null) {
        this.filtros = {
          ...this.filtros,
          no_juicio: this.filtros.query.trim(),
          actuacion_folio: null,
          acuerdo_folio: null,
          page,
        };
      }

      if (filterFolioActuacion.exec(this.filtros.query) !== null) {
        this.filtros = {
          ...this.filtros,
          actuacion_folio: this.filtros.query.trim(),
          no_juicio: null,
          acuerdo_folio: null,
        };
      }

      if (filterFolioAcuerdo.exec(this.filtros.query) !== null) {
        this.filtros = {
          ...this.filtros,
          acuerdo_folio: this.filtros.query.trim(),
          no_juicio: null,
          actuacion_folio: null,
          page,
        };
      }

      try {
        await this.$store.dispatch('expedientesElectronicos/fetchAllExpedientesElectronicos', {
          ...this.filtros,
          query: null,
        });

        if (this.resultados.length === 0) {
          this.fetching = false;
          this.$swal({
            ...sweetAlertConfig,
            icon: 'error',
            title: 'Numero de folio no encontrado',
          });
          this.fetching = false;
          this.filtros.query = null;
          return Promise.resolve(false);
        }

        const acuerdos = this.resultados.map(i => i.acuerdo_id);

        if (acuerdos.length > 0) {
          const acuerdosId = acuerdos.join(',');

          await this.$store.dispatch('notificaciones/fetchAllNotificaciones', {
            limit: -1,
            acuerdo_id: acuerdosId,
          });
        }

        const autoridades = this.resultados.map((i) => {
          const temp = i.expediente?.autoridades_substanciadoras ?? [];
          return temp.map(j => j.id);
        }).flat();

        if (autoridades.length > 0) {
          const autoridadesId = autoridades.join(',');

          await this.$store.dispatch('autoridades/fetchAllAutoridades', {
            limit: -1,
            autoridad_id: autoridadesId,
          });
        }

        this.fetching = false;
        return Promise.resolve(true);
      } catch (e) {
        errors(e);
        this.fetching = false;
        return Promise.resolve(false);
      }
    },
  },
  watch: {
    'filtros.query': {
      handler(val) {
        if (val === '') {
          this.filtros.page = 1;
          this.filtros.query = null;
          this.filtros.no_juicio = null;
          this.filtros.actuacion_folio = null;
          this.filtros.acuerdo_folio = null;
        }
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
  .SIDJ-box {
    background: rgba(42, 63, 84, 0.04);
    margin: 10px;
    padding: 10px;
    background-color: #fff;
  }

  .SIDJ-box label{
    font-size: 16px;
    font-weight: 700;
  }
</style>
