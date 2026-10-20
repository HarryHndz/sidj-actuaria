<template>
  <q-card style="width: 900px; max-width: 90vw;">
    <q-card-section class="row items-center">
      <div class="text-h6 q-ml-md">Nuevo listado de acuerdos</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-separator/>

    <q-card-section>
      <div>
        <div class="q-pt-sm">
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
                @blur="$v.formDataL.ponencia_id.$touch"
                :error="$v.formDataL.ponencia_id.$error"
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
                @blur="$v.formDataL.actuario_id.$touch"
                :error="$v.formDataL.actuario_id.$error"
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
                @blur="$v.formDataL.tipo_leyenda_id.$touch"
                :error="$v.formDataL.tipo_leyenda_id.$error"
                error-message="Leyenda es una opción obligatorio"
              />
            </div>
          </div>
        </div>
      </div>
    </q-card-section>

    <q-separator/>

    <q-card-actions>
      <div class="col-md-6" align="left">
        <q-btn class="q-ma-sm q-ml-md"
          color="pink-10"
          icon="arrow_back"
          label="Regresar"
          @click.prevent="$emit('openModalFecha')"
        />
      </div>
      <div class="col-md-6" align="right">
        <q-btn class="q-ma-sm q-ml-md"
          color="pink-10"
          icon="save"
          label="Guargar"
          :loading="fetching"
          @click.prevent="guardarListado"
        />
      </div>
    </q-card-actions>
  </q-card>
</template>

<script>
import {
  QBtn,
  QCard,
  QSpace,
  QSelect,
  ClosePopup,
  QSeparator,
  QCardActions,
  QCardSection,
} from 'quasar';

import {
  required,
} from 'vuelidate/lib/validators';

import _ from 'lodash';

import sidjbridge from 'boot/sidjbridge';

import updateState from 'src/store/utlils';

export default {
  name: 'modal-form-listado',
  props: {
    formData: {
      type: Object,
      required: true,
    },
    acuerdo: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      fetching: false,
      leyendaObject: null,
      actuarioObject: null,
      ponenciaObject: null,
      aFiltered: this.actuarios,
      pFiltered: this.ponencias,
      formDataL: {
        actuario_id: null,
        ponencia_id: null,
        tipo_listado_id: 1,
        tipo_leyenda_id: null,
        fecha_publicacion: this.formData.fecha_publicacion,
      },
    };
  },
  validations: {
    formDataL: {
      ponencia_id: {
        required,
      },
      actuario_id: {
        required,
      },
      tipo_leyenda_id: {
        required,
      },
    },
  },
  directives: {
    ClosePopup,
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
  computed: {
    ponencias() {
      const ponencias = this.$store.getters['ponencias/getPonenciasAll'].map(item => ({
        label: `${item.clave} ${item.ponencia}`,
        value: item.ponencia_id,
      }));

      return ponencias.sort((a, b) => {
        if (a.value > b.value) {
          return 1;
        }
        if (a.value < b.value) {
          return -1;
        }
        return 0;
      });
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
    listadoDuplicado() {
      return this.$store.getters['listadosAcuerdos/getListadoAcuerdoByPF'](this.formDataL.ponencia_id, this.formDataL.fecha_publicacion, this.formDataL.actuario_id);
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
    guardarListado() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.fetching = true;

        return sidjbridge.get('/v1/searchAcuerdos/acuerdos/', {
          params: {
            folioAcuerdo: this.acuerdo.noFolio,
          },
        }).then((response) => {
          this.$store.dispatch('listadosAcuerdos/fetchAllListadosAcuerdos', {
            ponencia_id: this.formDataL.ponencia_id,
            fecha_publicacion: this.formDataL.fecha_publicacion,
            actuario_id: this.formDataL.actuario_id,
          }).then((resp) => {
            if (resp.length > 0) {
              this.$emit('mensajeGuardarListado', this.listadoDuplicado);
            } else {
              let lista = [];
              lista = updateState(lista, response.data.data[0]);

              return this.$store.dispatch('listadosAcuerdos/postListadoAcuerdo', {
                ...this.formDataL,
                lista,
              }).then((respListado) => {
                this.fetching = false;

                this.$router.push({
                  name: 'listado-acuerdo',
                  params: {
                    uuid: respListado.id,
                  },
                });

                return Promise.resolve(true);
              });
            }
            return Promise.resolve(true);
          });
        });
      }
      return Promise.resolve(true);
    },
  },
  watch: {
    actuarioObject(val) {
      /* eslint no-unused-expressions: [2, { allowTernary: true }] */
      val != null ? this.formDataL.actuario_id = val.value : this.formDataL.actuario_id = '';
    },
    leyendaObject(val) {
      val != null ? this.formDataL.tipo_leyenda_id = val.value : this.formDataL.tipo_leyenda_id = '';
    },
    ponenciaObject(val) {
      /* eslint no-unused-expressions: [2, { allowTernary: true }] */
      val != null ? this.formDataL.ponencia_id = val.value : this.formDataL.ponencia_id = '';
    },
  },
};
</script>
