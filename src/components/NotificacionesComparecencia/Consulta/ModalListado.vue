<template>
  <q-card style="width: 1000px; max-width: 110vw;">
    <q-card-section class="row items-center">
      <div class="text-h6 q-ml-md">Editar</div>
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
              @filter="filterActuarioFn"
              @blur="$v.formData.actuario_id.$touch"
              :error="$v.formData.actuario_id.$error"
              error-message="El campo actuario es requerido"
            />
          </div>
        </div>

        <div class="col-md-6">
          <q-input outlined
            minimal
            class="q-ma-sm"
            mask="####-##-##"
            label="Fecha de publicación"
            style="margin: 15px 10px 0px 10px;"
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
                  <q-date
                    color="pink-10"
                    :options="dateFn"
                    v-model="formData.fecha_publicacion"
                    @input="() => $refs.qDateProxy.hide()"
                  />
                </q-popup-proxy>
              </q-icon>
            </template>
          </q-input>
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
  QSelect,
  ClosePopup,
  QSeparator,
  QPopupProxy,
  QCardActions,
  QCardSection,
} from 'quasar';

import moment from 'moment';

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
      actuarioObject: null,
      ponenciaObject: null,
      showModal: true,
      aFiltered: this.actuarios,
      pFiltered: this.ponencias,
      formData: {
        id: this.lista.id,
        actuario_id: this.lista.actuario_id,
        ponencia_id: this.lista.ponencia_id,
        fecha_publicacion: this.lista.fecha_publicacion,
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
        ponencia_id: {
          required,
        },
        fecha_publicacion: {
          required,
          validateDate: (date) => {
            const diasInhabiles = this.diasInhabiles.map(i => i.fecha);
            const dateValidate = moment(date, 'YYYY-MM-DD');
            const dayWeek = moment(new Date(date), 'YYYY-MM-DD').day();
            const dateMoment = moment(new Date(date)).add(25, 'hours').format('YYYY-MM-DD h:mm:ss a');
            const today = moment().format('YYYY-MM-DD h:mm:ss a');

            return !(dayWeek === 6 || dayWeek === 5)
              && moment(today).isBefore(moment(dateMoment))
              && dateValidate.isValid()
              && !diasInhabiles.includes(date);
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
  beforeMount() {
    if (this.formData.actuario_id) {
      this.actuarioObject = this.actuarios.find(item => item.value === this.formData.actuario_id);
    }
    if (this.formData.ponencia_id) {
      this.ponenciaObject = this.ponencias.find(item => item.value === this.formData.ponencia_id);
    }
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
      return this.$store.getters['listadosAcuerdosComparecencia/getListadoAcuerdoByPF'](this.ponencia_id, this.formData.fecha_publicacion, this.formData.actuario_id);
    },
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
  },
  methods: {
    dateFn(date) {
      const diasInhabiles = this.diasInhabiles.map(i => i.fecha.split('-').join('/'));
      const dayWeek = moment(new Date(date), 'YYYY-MM-DD').day();
      const dateMoment = moment(new Date(date)).add(17, 'hours').format('YYYY-MM-DD h:mm:ss a');
      const today = moment().format('YYYY-MM-DD h:mm:ss a');

      return !(dayWeek === 6 || dayWeek === 0)
        && moment(today).isBefore(moment(dateMoment))
        && !diasInhabiles.includes(date);
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
        this.fetching = true;
        this.$store.dispatch('listadosAcuerdosComparecencia/fetchAllListadosAcuerdos', {
          ponencia_id: this.ponencia_id,
          fecha_publicacion: this.formData.fecha_publicacion,
          actuario_id: this.formData.actuario_id,
        }).then((resp) => {
          if (resp.length === 0) {
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
                  name: 'listado-notificaciones-comparecencia',
                  params: {
                    uuid: this.listadoDuplicado.id,
                  },
                });
              }
            });
          }
        });
      }
    },
    updateListado(formData) {
      this.$store.dispatch('listadosAcuerdosComparecencia/putListadoAcuerdo', {
        ...formData,
      }).then(() => {
        this.fetching = false;
        Notify.create({
          message: 'Listado actualizado correctamente.',
          position: 'bottom',
        });
        this.$emit('cerrar');
      }).catch(() => {
        this.fetching = false;
        Notify.create({
          message: 'Ocurrió un error, intentelo mas tarde.',
          position: 'bottom',
        });
      });
    },
    acumularAcuerdos() {
      const ids = new Set(this.listadoDuplicado.lista.map(d => d.id));
      const lista = [
        ...this.listadoDuplicado.lista,
        ...this.lista.lista.filter(d => !ids.has(d.id)),
      ];

      this.fetchingAcumulacion = true;
      this.$store.dispatch('listadosAcuerdosComparecencia/putListadoAcuerdo', {
        id: this.listadoDuplicado.id,
        lista,
      }).then(() => {
        this.$store.dispatch('listadosAcuerdosComparecencia/putListadoAcuerdo', {
          id: this.lista.id,
          lista: [],
        }).then(() => {
          this.$store.dispatch('listadosAcuerdosComparecencia/deleteListadoAcuerdo', {
            id: this.lista.id,
          }).then(() => {
            this.$router.push({
              name: 'listado-notificaciones-comparecencia',
              params: {
                uuid: this.listadoDuplicado.id,
              },
            });
          });
        });
      });
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
  },
};
</script>
