<template>
  <div class="q-pa-md">
    <div class="q-pa-sm header shadow-5" :class="bgColor">
      <q-breadcrumbs style="margin: auto 0px;">
        <q-breadcrumbs-el label="Inicio" icon="home" to="/" active-color="black"/>
        <q-breadcrumbs-el label="Busqueda" icon="search" :to="{name: 'expediente-busqueda'}" />
        <q-breadcrumbs-el label="Consulta de expediente" icon="view_quilt"/>
      </q-breadcrumbs>

      <q-space/>

      <historial-header />
    </div>

    <div class="q-gutter-y-sm">
      <div class="q-mb-sm text-center titulo">
        <strong>CONSULTA DE EXPEDIENTE v{{ env.VERSION_CONSULTA_EXPEDIENTE }}</strong>
      </div>

      <div class="SIDJ-box">
        <div class="row">
          <div class="col-md-12 col-xs-12">
            <label class="q-ma-sm" for="query">Búsqueda</label>
            <q-input
              outlined
              autofocus
              stack-label
              autocomplete="off"
              name="nojuicio"
              label="No juicio, Folio actuación, R.A."
              class="q-mx-sm q-my-md"
              v-model="filtros.query"
              v-on:keyup.enter="busqueda"
            />
          </div>

          <template v-if="busqueda_avanzada">
            <div class="col-md-6">
              <q-input
                outlined
                stack-label
                class="q-mx-sm q-my-md"
                mask="####-##-##"
                autocomplete="off"
                name="fecha_inicio"
                label="Fecha de inicio"
                v-on:keyup.enter="busqueda"
                v-model="filtros.fecha_inicio"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      ref="qDateInicial"
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date
                        v-model="filtros.fecha_inicio"
                        @input="() => $refs.qDateInicial.hide()"
                      />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <div class="col-md-6">
              <q-input
                outlined
                stack-label
                class="q-mx-sm q-my-md"
                mask="####-##-##"
                autocomplete="off"
                name="Fecha final"
                label="Fecha final"
                v-on:keyup.enter="busqueda"
                v-model="filtros.fecha_fin"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      ref="qDateFinal"
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date
                        v-model="filtros.fecha_fin"
                        @input="() => $refs.qDateFinal.hide()"
                      />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>

            <div class="col-md-6">
              <q-select
                outlined
                use-input
                clearable
                stack-label
                class="q-mx-sm q-my-md"
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
                class="q-mx-sm q-my-md"
                label="Ponencia"
                :options="pFiltered"
                v-model="ponenciaObject"
                @filter="filterPonenciaFn"
              />
            </div>

            <div class="col-md-6 col-xs-6">
              <q-select
                outlined
                clearable
                emit-value
                stack-label
                map-options
                name="materia"
                label="Materia"
                class="q-mx-sm q-my-md"
                :options="materias"
                v-model="filtros.materia"
              >
              </q-select>
            </div>

            <div class="col-md-6 col-xs-6">
              <q-select
                outlined
                clearable
                emit-value
                map-options
                stack-label
                name="tipo_demanda"
                label="Tipo de demanda"
                class="q-mx-sm q-my-md"
                :options="tiposDemandas"
                v-model="filtros.tipo_demanda"
              >
              </q-select>
            </div>

            <div class="col-md-6">
              <q-input
                outlined
                autocomplete="off"
                stack-label
                name="Actor"
                label="Actor"
                class="q-mx-sm q-my-md"
                v-model="filtros.actor"
                v-on:keyup.enter="busqueda"
              />
            </div>

            <div class="col-md-6">
              <q-input
                outlined
                stack-label
                autocomplete="off"
                name="Autoridad"
                label="Autoridad"
                class="q-mx-sm q-my-md"
                v-model="filtros.autoridad"
                v-on:keyup.enter="busqueda"
              />
            </div>
          </template>

          <div class="col-md-6" align="left">
            <q-btn
              class="q-ma-sm q-mt-md"
              color="warning"
              icon="search"
              label="Buscar"
              :loading="fetching"
              @click.prevent="busqueda"
            />
          </div>
          <div class="col-md-6" align="right">
            <q-btn
              class="q-ma-sm q-mt-md"
              color="warning"
              :icon="busqueda_avanzada ? 'expand_less' : 'expand_more'"
              @click.prevent="busqueda_avanzada = !busqueda_avanzada"
            />
          </div>
        </div>
      </div>

      <q-separator style="margin: 30px 5px" />

      <div class="x_content text-center" v-if="fetching">
        <q-spinner color="black" size="4em" :thickness="5" />
      </div>

      <contenedor-expedientes
        v-if="!fetching && resultados.length > 0"
        :resultados="resultados"
      >
      </contenedor-expedientes>

      <template v-if="resultados.length == 0 && !fetching">
        <div class="x_content">
          <h6 class="text-center">No se encontraron resultados</h6>
        </div>
      </template>

      <div
        v-if="pagination.total > 10 && !fetching"
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
  QDate,
  QInput,
  QSelect,
  Loading,
  QSpinner,
  QSeparator,
  QPagination,
  QPopupProxy,
  QBreadcrumbs,
  QSpinnerGears,
  QBreadcrumbsEl,
} from 'quasar';

import axios from 'axios';
import moment from 'moment';

import _ from 'lodash';

import 'src/css/SIDJ-style.css';
import 'src/css/ConsultaExpediente.sass';

import env from 'boot/env';
import errors from 'boot/errors';

import HistorialHeader from 'components/Generales/HistorialHeader';
import ContenedorExpedientes from 'components/ExpedienteConsulta/Busqueda/ContenedorExpedientes';

export default {
  name: 'expediente-busqueda',
  data() {
    return {
      fetching: false,
      busqueda_avanzada: false,
      ponenciaObject: null,
      salaObject: null,
      pFiltered: this.ponencias,
      sFiltered: this.salas,
      filtros: {
        page: 1,
        limit: 10,
        query: null,
        nojuicio: null,
        include: 'actores,autoridades,autorizados,terceros_perjudicados,demanda',
        orderBy: 'desc',
        actor: null,
        autoridad: null,
        sala: null,
        ponencia: null,
        materia: null,
        tipo_demanda: null,
      },
    };
  },
  components: {
    QDate,
    QInput,
    QSelect,
    QSpinner,
    QSeparator,
    QPagination,
    QPopupProxy,
    QBreadcrumbs,
    QBreadcrumbsEl,
    HistorialHeader,
    ContenedorExpedientes,
  },
  async preFetch({ store }) {
    Loading.show({
      spinner: QSpinnerGears,
      backgroundColor: 'pink-8',
    });
    try {
      const dateLimit = env.DATE_CACHE_LIMIT
        ? env.DATE_CACHE_LIMIT
        : '2024-02-29 23:59:59';

      const cache = moment().isAfter(dateLimit);

      await axios.all([
        store.dispatch('materias/fetchAllMaterias', {
          limit: -1,
          cache: true,
        }),
        store.dispatch('procesos/fetchAllProcesos', {
          limit: -1,
        }),
        store.dispatch('ponencias/fetchAllPonencias', {
          cache,
          limit: -1,
        }),
        store.dispatch('salas/fetchAllSalas', {
          cache,
          limit: -1,
        }),
        store.dispatch('promoventes/fetchAllPromoventes', {
          cache,
          limit: -1,
        }),
        store.dispatch('tiposDemandas/fetchAllTiposDemandas', {
          limit: -1,
        }),
        store.dispatch('tiposJuicios/fetchAllTiposJuicios', {
          cache,
          limit: -1,
        }),
      ]);
    } catch (e) {
      errors(e);
    } finally {
      Loading.hide();
    }
  },
  beforeCreate() {
    this.$emit('leftDrawerOpen', false);
  },
  beforeRouteLeave(to, from, next) {
    this.$store.dispatch('layoutsLabels/setMainColor', 'pink-10');
    this.$store.dispatch('layoutsLabels/setBgHeaderColor', 'bg-pink-2');
    this.$store.dispatch('layoutsLabels/setBgHeaderLayoutColor', 'bg-pink-10');
    next();
  },
  computed: {
    env() {
      return env;
    },
    folio() {
      if (this.resultados[0].no_folio) {
        const data = this.resultados[0].no_folio.split('/');
        return data[0];
      }
      return null;
    },
    bgColor() {
      return this.$store.getters['layoutsLabels/getBgHeaderColor'];
    },
    materias() {
      const salas = this.$store.getters['materias/getMateriasAll'].map(item => ({
        label: item.materia,
        value: item.materia_id,
      }));
      return _.orderBy(salas, ['label', 'value'], ['asc', 'asc']);
    },
    salas() {
      const salas = this.$store.getters['salas/getSalasAll'].map(item => ({
        label: item.sala,
        value: item.sala_id,
      }));
      return _.orderBy(salas, ['value', 'label'], ['asc', 'asc']);
    },
    ponencias() {
      let ponencias = this.$store.getters['ponencias/getPonenciasAll'].map(item => ({
        label: `${item.clave} ${item.ponencia}`,
        value: item.ponencia_id,
        sala_id: item.sala_id,
      }));

      if (this.filtros.sala) {
        ponencias = ponencias.filter(item => item.sala_id === this.filtros.sala);
      }

      return _.orderBy(ponencias, ['value', 'label'], ['asc', 'asc']);
    },
    tiposDemandas() {
      let tiposDemandas = this.$store.getters['tiposDemandas/getTiposDemandasAll'].map(item => ({
        label: item.descripcion,
        value: item.tipo_demanda_id,
        materias: item.materias,
      }));

      if (this.filtros.materia) {
        tiposDemandas = tiposDemandas.filter(item => item.materias.includes(this.filtros.materia));
      }

      return _.orderBy(tiposDemandas, ['label'], ['asc']);
    },
    pagination() {
      return this.$store.getters['expedientes/getExpedientesPagination'];
    },
    resultados() {
      return this.$store.getters['expedientes/getExpedientesVisibles'];
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
    async busqueda(page) {
      this.fetching = true;

      if (!Number.isInteger(page)) {
        page = 1;
      }

      const filterNoJuicio = /^((TJA|TJ|TE)(-|\/))?((X{0,3})?(IX|IV|V?I{0,3}))?(-)(\d{1,5})?(0?[0-9]{2})(\/\d{4})?|^TJA-\d{3,8}(\/\d{4}(-[A-Z0-9]{2,4})?)?$/;
      const filterRa = /^(R\.A|TJA-R\.A|RAJ|RAE)?((\.)(\d{1,4}))?(0?|[0-9]{2})?(\/(\d{4}))?$|^RA-\d{3,8}(\/\d{4}(-P\d)?)?$/;
      const filterFolio = /^(\d{5,10})$/;

      if (filterNoJuicio.exec(this.filtros.query) !== null) {
        this.filtros = {
          ...this.filtros,
          page,
          nojuicio: this.filtros.query,
        };
      }

      if (filterRa.exec(this.filtros.query) !== null) {
        this.filtros = {
          ...this.filtros,
          query: null,
          nora: this.filtros.query,
        };
      }

      if (filterFolio.exec(this.filtros.query) !== null) {
        this.filtros = {
          ...this.filtros,
          page,
          folio_actuacion: this.filtros.query,
        };
      }

      await this.$store.dispatch('expedientes/fetchAllExpedientes', {
        ...this.filtros,
        query: null,
      });

      this.fetching = false;

      if (this.pagination.total === 1) {
        this.$router.push({
          name: 'expediente-consulta',
          params: {
            uuid: this.resultados[0].id,
          },
        });
      }
    },
  },
  watch: {
    'filtros.query': {
      handler(val) {
        if (val === '') {
          this.filtros.page = 1;
          this.filtros.query = null;
          this.filtros.nojuicio = null;
        }
      },
      deep: true,
    },
    salaObject(val) {
      /* eslint no-unused-expressions: [2, { allowTernary: true }] */
      val != null ? this.filtros.sala = val.value : this.filtros.sala = '';
    },
    ponenciaObject(val) {
      /* eslint no-unused-expressions: [2, { allowTernary: true }] */
      val != null ? this.filtros.ponencia = val.value : this.filtros.ponencia = '';
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
</style>
