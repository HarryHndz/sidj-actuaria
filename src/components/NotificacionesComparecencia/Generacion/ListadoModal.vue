<template>
  <q-card style="width: 900px; max-width: 90vw;">
    <q-card-section class="row items-center">
      <div class="text-h6 q-ml-md">Nuevo listado</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-separator/>

    <q-card-section>
      <div class="q-pt-sm">
        <div class="row">
          <div class="col-md-12">
            <q-select
              outlined
              use-input
              clearable
              class="q-ma-sm"
              label="Área"
              v-model="areaObject"
              :options="areaFiltered"
              @filter="filterAreaFn"
              @blur="$v.formData.area_id.$touch"
              :error="$v.formData.area_id.$error"
              error-message="Área es una opción obligatorio"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-12">
            <q-select
              outlined
              use-input
              clearable
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
import moment from 'moment';

import {
  required,
} from 'vuelidate/lib/validators';

export default {
  name: 'listado-modal',
  data() {
    return {
      fetching: false,
      areaObject: null,
      ponenciaObject: null,
      actuarioObject: null,
      pFiltered: this.ponencias,
      aFiltered: this.actuarios,
      areaFiltered: this.areas,
      formData: {
        area_id: null,
        actuario_id: null,
        ponencia_id: null,
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
  validations: {
    formData: {
      area_id: {
        required,
      },
      ponencia_id: {
        required,
      },
      actuario_id: {
        required,
      },
    },
  },
  beforeMount() {
    if (this.localizacion) {
      this.areaObject = this.areas.find(item => item.value === this.localizacion.area_id);
    }
  },
  computed: {
    areas() {
      const areas = this.$store.getters['areas/getAreasAll'].map(item => ({
        label: item.area,
        value: item.area_id,
        es_jurisdiccional: item.atributos.es_jurisdiccional,
      })).filter(i => i.es_jurisdiccional);

      return _.orderBy(areas, ['label', 'value'], ['asc', 'asc']);
    },
    ponencias() {
      const ponencias = this.$store.getters['ponencias/getPonenciasAll'].map(item => ({
        label: `${item.clave} ${item.ponencia}`,
        value: item.ponencia_id,
      }));

      return _.orderBy(ponencias, ['value', 'label'], ['asc', 'asc']);
    },
    localizacion() {
      return this.$store.getters['session/getLocalizacion'];
    },
    actuarios() {
      return this.$store.getters['actuarios/getActuariosAll'].map(item => ({
        label: item.actuario,
        value: item.actuario_id,
      }));
    },
  },
  methods: {
    filterAreaFn(val, update) {
      update(() => {
        const needle = val.toLowerCase();
        this.areaFiltered = this.areas.filter(v => v.label.toLowerCase().indexOf(needle) > -1);
      });
    },
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
    save() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$emit('saveListado', this.formData);
      }
    },
    dateFn(date) {
      const dayWeek = moment(new Date(date), 'YYYY-MM-DD').day();
      const dateMoment = moment(new Date(date)).add(12, 'hours').format('YYYY-MM-DD h:mm:ss a');
      const today = moment().format('YYYY-MM-DD h:mm:ss a');

      return !(dayWeek === 6 || dayWeek === 0) && moment(today).isBefore(moment(dateMoment));
    },
    avanzar() {
      this.$v.$touch();
      if (this.formData.ponencia_id && this.formData.actuario_id) {
        this.$emit('avanzar', this.formData);
      }
    },
  },
  watch: {
    areaObject(val) {
      /* eslint no-unused-expressions: [2, { allowTernary: true }] */
      val != null ? this.formData.area_id = val.value : this.formData.area_id = null;
    },
    actuarioObject(val) {
      /* eslint no-unused-expressions: [2, { allowTernary: true }] */
      val != null ? this.formData.actuario_id = val.value : this.formData.actuario_id = null;
    },
    ponenciaObject(val) {
      /* eslint no-unused-expressions: [2, { allowTernary: true }] */
      val != null ? this.formData.ponencia_id = val.value : this.formData.ponencia_id = null;
    },
  },
};
</script>
