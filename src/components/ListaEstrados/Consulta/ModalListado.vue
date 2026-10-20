<template>
  <q-card style="width: 1100px; max-width: 90vw;">
    <q-card-section class="row items-center">
      <div class="text-h6 q-ml-md">Editar</div>
      <q-space />
      <q-btn icon="close" flat round dense v-close-popup />
    </q-card-section>

    <q-separator/>

    <q-card-section>
      <div class="q-pt-sm">
        <div class="row">
          <div class="col-md-6 col-xs-12">
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

          <div class="col-md-6 col-xs-12">
            <q-select
              outlined
              use-input
              clearable
              stack-label
              class="q-ma-sm"
              label="Actuario"
              :options="aFiltered"
              v-model="actuarioObject"
              @filter="filterActuarioFn"
              @blur="$v.formData.actuario_id.$touch"
              :error="$v.formData.actuario_id.$error"
              error-message="El campo actuario es requerido"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 col-xs-12">
            <q-input outlined
              minimal
              stack-label
              class="q-ma-sm"
              mask="####-##-##"
              label="Fecha de publicación"
              v-model="formData.fecha_publicacion"
              @blur="$v.formData.fecha_publicacion.$touch"
              :error="$v.formData.fecha_publicacion.$error"
              error-message="El campo fecha publicación tiene que ser una fecha valida"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="qDateProxy"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="formData.fecha_publicacion"
                      :options="dateFn"
                      color="pink-10"
                      @input="() => $refs.qDateProxy.hide()"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>

          <div class="col-md-6 col-xs-12">
            <q-input outlined
              minimal
              stack-label
              class="q-ma-sm"
              mask="####-##-##"
              label="Fecha de surge efecto"
              v-model="formData.fecha_surge_efectos"
              @blur="$v.formData.fecha_surge_efectos.$touch"
              :error="$v.formData.fecha_surge_efectos.$error"
              error-message="El campo fecha de surge efectos tiene que ser una fecha valida"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy ref="qDateProxy"
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date v-model="formData.fecha_surge_efectos"
                      :options="dateFnEfectos"
                      color="pink-10"
                      @input="() => $refs.qDateProxy.hide()"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
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
        icon="save"
        color="pink-10"
        label="Guardar"
        :loading="fetching"
        @click.prevent="save"
      />
    </q-card-actions>

  </q-card>
</template>

<script>
import {
  QBtn,
  QCard,
  QDate,
  QInput,
  Notify,
  QSpace,
  Loading,
  QSelect,
  ClosePopup,
  QSeparator,
  QPopupProxy,
  QCardActions,
  QCardSection,
} from 'quasar';

import _ from 'lodash';
import moment from 'moment';

import errors from 'boot/errors';

import {
  required,
} from 'vuelidate/lib/validators';

const sweetAlertConfig = {
  text: '',
  type: 'success',
  showCancelButton: false,
  confirmButtonColor: '#3085d6',
  confirmButtonText: 'Ok',
};

export default {
  name: 'modal-listado',
  props: {
    lista: {
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
      showModal: true,
      aFiltered: this.actuarios,
      pFiltered: this.ponencias,
      formData: {
        id: this.lista.id,
        actuario_id: this.lista.actuario_id,
        ponencia_id: this.lista.ponencia_id,
        tipo_leyenda_id: this.lista.tipo_leyenda_id,
        fecha_publicacion: this.lista.fecha_publicacion,
        fecha_surge_efectos: this.lista.fecha_surge_efectos,
      },
      ponencia_id: this.lista.ponencia_id,
    };
  },
  validations() {
    return {
      formData: {
        actuario_id: {
          required,
        },
        tipo_leyenda_id: {
          required,
        },
        ponencia_id: {
          required,
        },
        fecha_publicacion: {
          required,
          validateDate: (date) => {
            const diasInhabiles = this.diasInhabiles.map(i => i.fecha);

            const selectedDate = moment(date, 'YYYY-MM-DD');
            const dayWeek = moment(new Date(date), 'YYYY-MM-DD').day();
            const dateMoment = moment(new Date(date)).add(18, 'hours').format('YYYY-MM-DD h:mm:ss a');

            const dateLimit = moment(this.timeServer).add(30, 'days').format('YYYY-MM-DD');
            const today = moment(this.timeServer).format('YYYY-MM-DD h:mm:ss a');

            return !(dayWeek === 6 || dayWeek === 5)
              && moment(today).isBefore(moment(dateMoment))
              && moment(dateMoment).isBefore(moment(dateLimit))
              && selectedDate.isValid()
              && !diasInhabiles.includes(date);
          },
        },
        fecha_surge_efectos: {
          validateDate: (date) => {
            if (date) {
              const selectedDate = moment(date, 'YYYY-MM-DD');
              const dayWeek = moment(new Date(date), 'YYYY-MM-DD').day();
              const dateMoment = moment(new Date(date)).add(18, 'hours').format('YYYY-MM-DD h:mm:ss a');

              const dateLimit = moment(this.timeServer).add(30, 'days').format('YYYY-MM-DD');
              const today = moment(this.timeServer).format('YYYY-MM-DD h:mm:ss a');

              return !(dayWeek === 6 || dayWeek === 5)
                && moment(today).isBefore(moment(dateMoment))
                && moment(dateMoment).isBefore(moment(dateLimit))
                && selectedDate.isValid();
            }
            return true;
          },
        },
      },
    };
  },
  directives: {
    ClosePopup,
  },
  components: {
    QBtn,
    QCard,
    QDate,
    QSpace,
    QInput,
    QSelect,
    QSeparator,
    QPopupProxy,
    QCardActions,
    QCardSection,
  },
  async beforeMount() {
    Loading.show();

    if (this.formData.actuario_id) {
      this.actuarioObject = this.actuarios.find(item => item.value === this.formData.actuario_id);
    }
    if (this.formData.ponencia_id) {
      this.ponenciaObject = this.ponencias.find(item => item.value === this.formData.ponencia_id);
    }
    if (this.formData.tipo_leyenda_id) {
      this.leyendaObject = this.leyendas.find(item => item.value === this.formData.tipo_leyenda_id);
    }

    await this.$store.dispatch('session/fetchTimeServer');

    Loading.hide();
  },
  computed: {
    actuarios() {
      return this.$store.getters['actuarios/getActuariosAll'].map(item => ({
        label: item.actuario,
        value: item.actuario_id,
      }));
    },
    diasInhabiles() {
      return this.$store.getters['diasInhabiles/getDiasInhabilesAll'];
    },
    listadoDuplicado() {
      return this.$store.getters['listadosAcuerdos/getListadoAcuerdoByPF'](this.formData.ponencia_id, this.formData.fecha_publicacion, this.formData.actuario_id);
    },
    ponencias() {
      const ponencias = this.$store.getters['ponencias/getPonenciasAll'].map(item => ({
        label: `${item.clave} ${item.ponencia}`,
        value: item.ponencia_id,
      }));

      return _.sortBy(ponencias, ['value', 'label']);
    },
    timeServer() {
      return this.$store.getters['session/getTimeServer'];
    },
    leyendas() {
      return _.sortBy(this.$store.getters['tiposLeyendas/getTiposLeyendasAll'].map(item => ({
        leyenda: item.leyenda,
        label: item.descripcion,
        value: item.tipo_leyenda_id,
        descripcion: item.descripcion,
      }), ['value', 'label']));
    },
  },
  methods: {
    dateFn(date) {
      const diasInhabiles = this.diasInhabiles.map(i => i.fecha);

      const dayWeek = moment(new Date(date), 'YYYY-MM-DD').day();
      const dateMoment = moment(new Date(date)).add(12, 'hours').format('YYYY-MM-DD h:mm:ss a');

      const dateLimit = moment(this.timeServer).add(30, 'days').format('YYYY-MM-DD');
      const today = moment(this.timeServer).format('YYYY-MM-DD h:mm:ss a');

      return !(dayWeek === 6 || dayWeek === 0)
        && moment(today).isBefore(moment(dateMoment))
        && moment(date).isBefore(moment(dateLimit))
        && !diasInhabiles.includes(date);
    },
    dateFnEfectos(date) {
      const dayWeek = moment(new Date(date), 'YYYY-MM-DD').day();
      const dateMoment = moment(new Date(date)).add(12, 'hours').format('YYYY-MM-DD h:mm:ss a');

      const dateLimit = moment(this.timeServer).add(30, 'days').format('YYYY-MM-DD');
      const today = moment(this.timeServer).format('YYYY-MM-DD h:mm:ss a');

      return !(dayWeek === 6 || dayWeek === 0)
        && moment(today).isBefore(moment(dateMoment))
        && moment(date).isBefore(moment(dateLimit));
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
    async save() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.fetching = true;
        const resp = await this.$store.dispatch('listadosAcuerdos/fetchAllListadosAcuerdos', {
          ponencia_id: this.formData.ponencia_id,
          actuario_id: this.formData.actuario_id,
          tipo_listado_id: this.formData.tipo_listado_id,
          tipo_leyenda_id: this.formData.tipo_leyenda_id,
          fecha_publicacion: this.formData.fecha_publicacion,
        });

        const changed = this.lista.ponencia_id !== this.formData.ponencia_id
          || this.lista.actuario_id !== this.formData.actuario_id
          || this.lista.tipo_leyenda_id !== this.formData.tipo_leyenda_id
          || this.lista.fecha_publicacion !== this.formData.fecha_publicacion;

        const condition = changed ? resp.length === 0 : resp.length === 1;

        if (condition) {
          this.updateListado(this.formData);
        } else {
          this.$emit('cerrar');
          this.$swal({
            ...sweetAlertConfig,
            icon: 'error',
            showCancelButton: true,
            confirmButtonText: 'Acumular acuerdos',
            cancelButtonText: 'Consultar listado',
            text: `Hay ${this.listadoDuplicado.lista.length} acuerdos registrados, \n ¿Desea acumularlos?`,
            title: 'Ya existe un listado registrado con dicha ponencia.',
          }).then((result) => {
            if (result.value) {
              this.acumularAcuerdos();
            } else if (result.dismiss === 'cancel') {
              this.$router.push({
                name: 'listado-acuerdo',
                params: {
                  uuid: this.listadoDuplicado.id,
                },
              });
            }
          });
        }
      }
      return Promise.resolve(true);
    },
    async updateListado(formData) {
      try {
        await this.$store.dispatch('listadosAcuerdos/putListadoAcuerdo', {
          ...formData,
        });
        this.fetching = false;
        Notify.create({
          message: 'Listado actualizado correctamente.',
          position: 'bottom',
        });
        this.$emit('cerrar');
        return Promise.resolve(true);
      } catch (e) {
        errors(e);
        this.fetching = false;
        return Promise.reject(true);
      }
    },
    async acumularAcuerdos() {
      const ids = new Set(this.listadoDuplicado.lista.map(d => d.id));
      const lista = [
        ...this.listadoDuplicado.lista,
        ...this.lista.lista.filter(d => !ids.has(d.id)),
      ];

      this.fetchingAcumulacion = true;

      try {
        await this.$store.dispatch('listadosAcuerdos/putListadoAcuerdo', {
          id: this.listadoDuplicado.id,
          lista,
        });
        await this.$store.dispatch('listadosAcuerdos/putListadoAcuerdo', {
          id: this.lista.id,
          lista: [],
        });
        await this.$store.dispatch('listadosAcuerdos/deleteListadoAcuerdo', {
          id: this.lista.id,
        });

        this.fetchingAcumulacion = false;

        this.$router.push({
          name: 'listado-acuerdo',
          params: {
            uuid: this.listadoDuplicado.id,
          },
        });
        return Promise.resolve(true);
      } catch (error) {
        errors(error);
        this.fetchingAcumulacion = false;
        return Promise.reject(true);
      }
    },
  },
  watch: {
    actuarioObject(val) {
      /* eslint no-unused-expressions: [2, { allowTernary: true }] */
      val != null ? this.formData.actuario_id = val.value : this.formData.actuario_id = '';
    },
    ponenciaObject(val) {
      /* eslint no-unused-expressions: [2, { allowTernary: true }] */
      val != null ? this.formData.ponencia_id = val.value : this.formData.ponencia_id = '';
    },
    leyendaObject(val) {
      /* eslint no-unused-expressions: [2, { allowTernary: true }] */
      val != null ? this.formData.tipo_leyenda_id = val.value : this.formData.tipo_leyenda_id = '';
    },
  },
};
</script>
