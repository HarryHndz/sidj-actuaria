<template>
  <q-card style="width: 800px; max-width: 90vw;">
    <q-card-section class="row items-center">
      <div class="text-h6 q-ml-md">Nuevo listado</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-separator/>

    <q-card-section>
      <div class="q-pt-sm">
        <div class="row" v-if="allowed">
          <div class="col-md-12">
            <q-select
              outlined
              clearable
              stack-label
              class="q-ma-sm"
              label="Tipo de listado"
              :options="tipoListados"
              v-model="tipoListadoObject"
              @blur="$v.formData.tipo_listado_id.$touch"
              :error="$v.formData.tipo_listado_id.$error"
              error-message="Tipo de listado es una opción obligatorio"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-12">
            <q-select
              outlined
              use-input
              clearable
              stack-label
              class="q-ma-sm"
              label="Ponencia"
              :options="pFiltered"
              v-model="ponenciaObject"
              @filter="filterPonenciaFn"
              @blur="$v.formData.ponencia_id.$touch"
              :error="$v.formData.ponencia_id.$error"
              error-message="Ponencia es una opción obligatorio"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-12">
            <q-select
              outlined
              use-input
              clearable
              stack-label
              class="q-ma-sm"
              label="Actuario"
              :options="aFiltered"
              v-model="actuarioObject"
              @blur="$v.formData.actuario_id.$touch"
              :error="$v.formData.actuario_id.$error"
              error-message="Actuario es una opción obligatorio"
              @filter="filterActuarioFn"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-12 col-xs-12">
            <q-select
              outlined
              clearable
              stack-label
              label="Leyenda"
              class="q-ma-sm"
              :options="leyendas"
              v-model="leyendaObject"
              @blur="$v.formData.tipo_leyenda_id.$touch"
              :error="$v.formData.tipo_leyenda_id.$error"
              error-message="Leyenda es una opción obligatorio"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-12 col-xs-12" v-if="leyendaObject">
            <div class="q-my-none q-mx-md"><strong>{{leyendaObject.descripcion}}</strong></div>
            <q-separator class="q-my-sm" />
            <div class="q-my-none q-mx-md" v-html="leyendaObject.leyenda"></div>
          </div>
        </div>
      </div>
    </q-card-section>

    <q-separator/>

    <q-card-actions align="right">
      <q-btn class="q-ma-md"
        color="pink-10"
        icon="arrow_forward"
        label="Siguiente"
        @click.prevent="avanzar"
      />
    </q-card-actions>

  </q-card>
</template>

<script>
/* eslint no-unused-expressions: [2, { allowTernary: true }] */
import {
  ClosePopup,
  Notify,
  QCard,
  QCardSection,
  QBtn,
  QCardActions,
  QSeparator,
  QSpace,
  QSelect,
} from 'quasar';

import _ from 'lodash';

import {
  required,
} from 'vuelidate/lib/validators';

export default {
  name: 'listado-modal',
  data() {
    return {
      allowed: false,
      fetching: false,
      leyendaObject: null,
      ponenciaObject: null,
      actuarioObject: null,
      tipoListadoObject: null,
      pFiltered: this.ponencias,
      aFiltered: this.actuarios,
      formData: {
        actuario_id: null,
        ponencia_id: null,
        tipo_leyenda_id: null,
        tipo_listado_id: 1,
      },
    };
  },
  directives: {
    ClosePopup,
  },
  plugins: {
    Notify,
  },
  components: {
    QCard,
    QCardSection,
    QBtn,
    QCardActions,
    QSeparator,
    QSpace,
    QSelect,
  },
  validations() {
    return {
      formData: {
        ponencia_id: {
          required,
        },
        actuario_id: {
          required,
        },
        tipo_leyenda_id: {
          required,
        },
        tipo_listado_id: {
          required,
        },
      },
    };
  },
  beforeMount() {
    if ([1, 44].some(i => this.permisos.some(j => i === j))) {
      this.allowed = true;
    }
  },
  computed: {
    ponencias() {
      const ponencias = this.$store.getters['ponencias/getPonenciasAll'].map(item => ({
        label: `${item.clave} ${item.ponencia}`,
        value: item.ponencia_id,
      }));

      return _.orderBy(ponencias, ['value', 'label'], ['asc', 'asc']);
    },
    actuarios() {
      return this.$store.getters['actuarios/getActuariosAll'].map(item => ({
        label: item.actuario,
        value: item.actuario_id,
      }));
    },
    leyendas() {
      const listado = _.sortBy(this.$store.getters['tiposLeyendas/getTiposLeyendasAll'].map(item => ({
        leyenda: item.leyenda,
        label: item.descripcion,
        value: item.tipo_leyenda_id,
        descripcion: item.descripcion,
        tipo_listado_id: item.tipo_listado_id,
      }), ['value', 'label']));

      if (this.formData.tipo_listado_id) {
        return listado.filter(i => i.tipo_listado_id === this.formData.tipo_listado_id);
      }
      return listado;
    },
    permisos() {
      return this.$store.getters['session/getRolesById'];
    },
    tipoListados() {
      const tiposListados = this.$store.getters['tiposListados/getTiposListadosAll'].map(item => ({
        label: item.descripcion,
        value: item.tipo_listado_id,
        slug: item.slug,
        modelo: item.modelo,
      }));

      return _.orderBy(tiposListados, ['value', 'label'], ['asc', 'asc']);
    },
  },
  methods: {
    filterActuarioFn(val, update) {
      update(() => {
        const needle = val.toLowerCase();
        this.aFiltered = this.actuarios.filter(v => v.label.toLowerCase().indexOf(needle) > -1);
      });
    },
    filterPonenciaFn(val, update) {
      update(() => {
        const needle = val.toLowerCase();
        this.pFiltered = this.ponencias.filter(v => v.label.toLowerCase().indexOf(needle) > -1);
      });
    },
    avanzar() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        if (this.formData.tipo_listado_id
            && this.formData.tipo_leyenda_id
        ) {
          this.$emit('avanzar', this.formData);
        }
      }
    },
  },
  watch: {
    actuarioObject(val) {
      val != null ? this.formData.actuario_id = val.value : this.formData.actuario_id = '';
    },
    leyendaObject(val) {
      val != null ? this.formData.tipo_leyenda_id = val.value : this.formData.tipo_leyenda_id = '';
    },
    tipoListadoObject(val) {
      val != null ? this.formData.tipo_listado_id = val.value : this.formData.tipo_listado_id = '';
    },
    ponenciaObject(val) {
      val != null ? this.formData.ponencia_id = val.value : this.formData.ponencia_id = '';
    },
  },
};
</script>
