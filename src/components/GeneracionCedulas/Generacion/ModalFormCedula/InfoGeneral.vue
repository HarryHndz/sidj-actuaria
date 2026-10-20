<template>
  <div>
    <div class="row">
      <div class="col-md-3">
        <q-select
          outlined
          clearable
          emit-value
          map-options
          stack-label
          class="q-ma-sm"
          label="Selección"
          :options="selections"
          v-model="selection"
        />
      </div>
      <template v-if="selection == 1">
        <div class="col-md-4">
          <q-select
            outlined
            use-input
            clearable
            stack-label
            class="q-ma-sm"
            label="Grupo de plantilla"
            :options="gFiltered"
            v-model="grupoObject"
            @filter="filterGrupoFn"
            :error="$v.formData.grupo_id.$error"
            error-message="Grupo es un campo obligatorio"
            @blur="$v.formData.grupo_id.$touch"
          />
        </div>
        <div class="col-md-5">
          <q-select
            outlined
            use-input
            clearable
            stack-label
            class="q-ma-sm"
            label="Plantilla"
            :options="pFiltered"
            v-model="plantillaObject"
            @filter="filterPlantillaFn"
            :error="$v.formData.plantilla_id.$error"
            error-message="Plantilla es un campo obligatorio"
            @blur="$v.formData.plantilla_id.$touch"
          />
        </div>
      </template>
      <template v-if="selection == 2">
        <div class="col-md-9">
          <q-file
            outlined
            clearable
            stack-label
            accept=".docx"
            v-model="file"
            class="q-ma-sm"
            @blur="$v.file.$touch"
            @input="guardarArchivo"
            :error="$v.file.$error"
            label="Subir archivo (plantilla .docx)"
            error-message="Archivo es un campo obligatorio"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
        </div>
      </template>
    </div>

    <div class="row">
      <div class="col-md-12" v-if="!tipoNotificacion">
        <q-select
          outlined
          use-input
          clearable
          stack-label
          class="q-ma-sm"
          label="Tipo de notificación"
          v-model="tipoNotificacionesObject"
          :options="tFiltered"
          :error="$v.formData.tipo_id.$error"
          error-message="Tipo de notificación es un campo obligatorio"
          @blur="$v.formData.tipo_id.$touch"
          @filter="filterTipoNotificacionFn"
        />
      </div>

      <div class="col-md-6">
        <q-select
          outlined
          clearable
          stack-label
          label="Actuario"
          class="q-ma-sm"
          v-model="actuarioObject"
          :options="actuarios"
          :error="$v.formData.actuario_id.$error"
          error-message="Actuario es un campo obligatorio"
          @blur="$v.formData.actuario_id.$touch"
        />
      </div>

      <div class="col-md-3">
        <q-input
          outlined
          stack-label
          type="number"
          label="Notificados"
          class="q-ma-sm"
          v-model="formData.notificados"
          @blur="$v.formData.notificados.$touch"
          :error="$v.formData.notificados.$error"
          error-message="Notificados es un campo requerido"
        />
      </div>

      <div class="col-md-3">
        <q-input outlined
          name="no_oficio"
          stack-label
          label="No de oficio"
          class="q-ma-sm"
          v-model="formData.no_oficio"
          :error-message="errorOficio"
          @blur="$v.formData.no_oficio.$touch"
          :error="$v.formData.no_oficio.$error"
        />
      </div>

      <div class="col-md-6">
        <q-input outlined
          stack-label
          class="q-ma-sm"
          mask="####-##-##"
          label="Fecha de elaboracion (AAAA-MM-DD)"
          v-model="formData.fecha_elaboracion_cedula"
          :error="$v.formData.fecha_elaboracion_cedula.$error"
          @blur="$v.formData.fecha_elaboracion_cedula.$touch"
          :error-message="errorFechaElaboracion"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy ref="qDateEA"
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  color="pink-10"
                  v-model="formData.fecha_elaboracion_cedula"
                  @input="() => $refs.qDateEA.hide()"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>

      <div class="col-md-6">
        <q-input outlined
          stack-label
          class="q-ma-sm"
          mask="####-##-##"
          label="Fecha entrega a actuaria (AAAA-MM-DD)"
          v-model="formData.fecha_entrega_actuaria"
          :error="$v.formData.fecha_entrega_actuaria.$error"
          @blur="$v.formData.fecha_entrega_actuaria.$touch"
          :error-message="errorFechaEntrega"
        >
          <template v-slot:append>
            <q-icon name="event" class="cursor-pointer">
              <q-popup-proxy ref="qDateE"
                transition-show="scale"
                transition-hide="scale"
              >
                <q-date
                  color="pink-10"
                  v-model="formData.fecha_entrega_actuaria"
                  @input="() => $refs.qDateE.hide()"
                />
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>
    </div>

    <div class="row">
      <div  class="col-md-12 col-xs-12">
        <q-input
          outlined
          autogrow
          stack-label
          class="q-ma-sm"
          label="Observaciones"
          v-model="formData.observaciones"
          @blur="$v.formData.observaciones.$touch"
          :error="$v.formData.observaciones.$error"
          error-message="Las observaciones deben ser mayor de 3 caracteres"
        />
      </div>
    </div>

    <q-separator class="q-my-md"/>

    <q-stepper-navigation class="q-pt-none">
      <div class="text-right">
        <q-btn class="q-ma-sm q-mx-md "
          @click="avanzar"
          color="pink-10"
          :loading="fetchingSave"
          label="Siguiente"
          icon="arrow_forward"
        />
      </div>
    </q-stepper-navigation>
  </div>
</template>

<script>
import {
  QIcon,
  QFile,
  QDate,
  QInput,
  QSelect,
  Loading,
  QPopupProxy,
  QStepperNavigation,
} from 'quasar';

import _ from 'lodash';

import {
  required, maxLength, minLength, requiredIf,
} from 'vuelidate/lib/validators';

import errors from 'boot/errors';
import infoFile from 'boot/infoFile';
import moment from 'moment';

export default {
  name: 'info-general',
  props: {
    data: {
      required: true,
      type: Object,
    },
    expediente: {
      required: true,
      type: Object,
    },
    fetchingSave: {
      required: true,
      type: Boolean,
    },
    tipoNotificacion: {
      required: false,
      type: Object,
    },
  },
  data() {
    return {
      file: null,
      selection: 1,
      grupoObject: null,
      actuarioObject: null,
      plantillaObject: null,
      tipoNotificacionesObject: null,
      pFiltered: this.plantillas,
      gFiltered: this.grupos,
      tFiltered: this.tipoNotificaciones,
      sizeAllowed: 4,
      formData: {
        grupo_id: null,
        actuario_id: null,
        plantilla_id: null,
        ...this.data,
      },
      selections: [
        {
          value: 1,
          label: 'Carpeta de archivos',
        },
        {
          value: 2,
          label: 'Subir archivo',
        },
      ],
    };
  },
  components: {
    QIcon,
    QDate,
    QFile,
    QInput,
    QSelect,
    QPopupProxy,
    QStepperNavigation,
  },
  validations() {
    if (this.selection === 1) {
      return {
        formData: {
          fecha_elaboracion_cedula: {
            required,
            validateDate: (date) => {
              const dateValidate = moment(date, 'YYYY-MM-DD', true);
              return dateValidate.isValid();
            },
          },
          fecha_entrega_actuaria: {
            required,
            validateDate: (date) => {
              const dateValidate = moment(date, 'YYYY-MM-DD', true);
              return dateValidate.isValid();
            },
          },
          tipo_id: {
            required,
          },
          grupo_id: {
            required,
          },
          no_oficio: {
            required,
            minLength: minLength(1),
            maxLength: maxLength(100),
          },
          plantilla_id: {
            required,
          },
          notificados: {
            required,
          },
          actuario_id: {
            required,
          },
          observaciones: {
            minLength: minLength(3),
            maxLength: maxLength(255),
          },
        },
      };
    }
    return {
      file: {
        required: requiredIf(nestedObject => !nestedObject.data.archivo_plantilla_id),
      },
      formData: {
        fecha_elaboracion_cedula: {
          required,
          validateDate: (date) => {
            const dateValidate = moment(date, 'YYYY-MM-DD', true);
            return dateValidate.isValid();
          },
        },
        fecha_entrega_actuaria: {
          required,
          validateDate: (date) => {
            const dateValidate = moment(date, 'YYYY-MM-DD', true);
            return dateValidate.isValid();
          },
        },
        tipo_id: {
          required,
        },
        no_oficio: {
          required,
          minLength: minLength(1),
          maxLength: maxLength(100),
        },
        notificados: {
          required,
        },
        observaciones: {
          minLength: minLength(3),
          maxLength: maxLength(255),
        },
      },
    };
  },
  beforeMount() {
    if (this.formData.actuario_id) {
      this.actuarioObject = this.actuarios.find(i => i.value === this.formData.actuario_id);
    }
    if (this.expediente.actuario_id) {
      this.actuarioObject = this.actuarios.find(i => i.value === this.expediente.actuario_id);
    }
    if (this.formData.plantilla_id) {
      this.plantillaObject = this.plantillas.find(i => i.value === this.formData.plantilla_id);
    }
    if (this.formData.tipo_id) {
      this.tipoNotificacionesObject = this.tipoNotificaciones
        .find(i => i.value === this.formData.tipo_id);
    }
    if (this.plantillaObject) {
      this.grupoObject = this.grupos.find(i => i.value === this.plantillaObject.grupo_id);
    }
    if (this.data.archivo_plantilla_id && this.data.plantilla_id) {
      this.selection = 1;
    } else if (this.data.archivo_plantilla_id && !this.data.plantilla_id) {
      this.selection = 2;
    } else {
      this.selection = 1;
    }
  },
  computed: {
    actuarios() {
      const actuarios = this.$store.getters['actuarios/getActuariosAll'].map(item => ({
        label: item.actuario,
        value: item.actuario_id,
      }));
      return _.orderBy(actuarios, ['label', 'value'], ['asc', 'asc']);
    },
    errorFechaEntrega() {
      if (!this.$v.formData.fecha_entrega_actuaria.$params.validateDate) {
        return 'El campo fecha entrega actuaria debe ser una fecha valida';
      }
      return 'El campo fecha entrega actuaria es un campo requerido';
    },
    errorFechaElaboracion() {
      if (!this.$v.formData.fecha_elaboracion_cedula.$params.validateDate) {
        return 'El campo fecha de elaboración debe ser una fecha valida';
      }
      return 'El campo fecha de elaboración es un campo requerido';
    },
    errorOficio() {
      const { min } = this.$v.formData.no_oficio.$params.minLength;
      const { max } = this.$v.formData.no_oficio.$params.maxLength;

      if (!this.$v.formData.no_oficio.minLength) {
        return `El campo no oficio debe tener al menos ${min} caracteres de longitud`;
      }
      if (!this.$v.formData.no_oficio.maxLength) {
        return `El campo no oficio debe tener maximo ${max} caracteres de longitud`;
      }
      return 'El campo de no de folio es un campo requerido';
    },
    grupos() {
      const grupos = this.$store.getters['gruposPlantillas/getGruposPlantillasVisibles'].map(item => ({
        label: item.nombre,
        value: item.grupo_id,
      }));
      return _.orderBy(grupos, ['label', 'value'], ['asc', 'asc']);
    },
    plantillas() {
      let plantillas = this.$store.getters['plantillas/getPlantillasVisibles'].map(item => ({
        label: item.nombre,
        value: item.plantilla_id,
        grupo_id: item.grupo_id,
        archivo_plantilla_id: item.archivoPlantilla?.data?.archivo_id ?? null,
      }));

      plantillas = plantillas.filter(i => i.grupo_id === this.formData.grupo_id);

      return _.orderBy(plantillas, ['label', 'value'], ['asc', 'asc']);
    },
    tipoNotificaciones() {
      const areas = this.$store.getters['tiposNotificaciones/getTiposNotificacionesAll']
        .filter(i => i.generar_cedula);

      return _.orderBy(areas.map(item => ({
        slug: item.slug,
        label: item.descripcion,
        value: item.tipo_notificacion_id,
      })), ['label'], ['asc']);
    },
  },
  methods: {
    filterGrupoFn(val, update) {
      update(() => {
        const needle = val.toLowerCase();
        this.gFiltered = this.grupos.filter(v => v.label.toLowerCase().indexOf(needle) > -1);
      });
    },
    filterPlantillaFn(val, update) {
      update(() => {
        const needle = val.toLowerCase();
        this.pFiltered = this.plantillas.filter(v => v.label.toLowerCase().indexOf(needle) > -1);
      });
    },
    filterTipoNotificacionFn(val, update) {
      update(() => {
        const needle = val.toLowerCase();
        this.tFiltered = this.tipoNotificaciones
          .filter(v => v.label.toLowerCase().indexOf(needle) > -1);
      });
    },
    avanzar() {
      this.$v.$touch();
      if (!this.$v.$invalid) {
        this.$emit('avanzar', this.formData);
      }
    },
    async guardarArchivo(file) {
      if (file) {
        Loading.show();

        if (file.size > this.sizeAllowed * 1024 * 1024) {
          Loading.hide();
          this.$emit('cerrar');
          this.$swal({
            title: `No está permitido subir\n archivos de más de ${this.sizeAllowed}mb`,
            icon: 'warning',
            showCancelButton: false,
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Ok',
          });
          return Promise.resolve(false);
        }

        try {
          const res = await infoFile(file);
          const fd = new FormData();
          fd.append('file', file);
          fd.append('hash', res.hash);

          const response = await this.$store.dispatch('archivos/postArchivosPlantillasTemporales', fd);
          Loading.hide();
          this.formData.archivo_plantilla_id = response.data.data?.id ?? null;

          this.showFormDocumento = true;

          return Promise.resolve(response.data.data);
        } catch (e) {
          errors(e);
          Loading.hide();
          this.$refs.filePickerDocument.removeAtIndex(0);
          return Promise.reject(true);
        }
      }
      return Promise.resolve(true);
    },
  },
  watch: {
    plantillaObject(val) {
      /* eslint no-unused-expressions: [2, { allowTernary: true }] */
      val != null ? this.formData.plantilla_id = val.value : this.formData.plantilla_id = null;
      val != null
        ? this.formData.archivo_plantilla_id = val.archivo_plantilla_id
        : this.formData.archivo_plantilla_id = null;
    },
    grupoObject(val, oldVal) {
      /* eslint no-unused-expressions: [2, { allowTernary: true }] */
      val != null ? this.formData.grupo_id = val.value : this.formData.grupo_id = null;

      if (oldVal) {
        this.plantillaObject = null;
        this.formData.plantilla_id = null;
        this.formData.archivo_plantilla_id = null;
      }
    },
    tipoNotificacionesObject(val) {
      /* eslint no-unused-expressions: [2, { allowTernary: true }] */
      val != null ? this.formData.tipo_id = val.value : this.formData.tipo_id = null;
      val != null
        ? this.formData.tipo_notificacion = val.slug
        : this.formData.tipo_notificacion = null;

      if (this.formData.tipo_id === 1) {
        this.$emit('updateTitle', 'Actores');
      }
      if (this.formData.tipo_id === 2) {
        this.$emit('updateTitle', 'Autoridades');
      }
      if (this.formData.tipo_id === 3) {
        this.$emit('updateTitle', 'Terceros');
      }
    },
    actuarioObject(val) {
      /* eslint no-unused-expressions: [2, { allowTernary: true }] */
      val != null ? this.formData.actuario_id = val.value : this.formData.actuario_id = null;
    },
    selection() {
      this.formData.grupo_id = null;
      this.grupoObject = null;
      this.formData.plantilla_id = null;
      this.plantillaObject = null;
    },
  },
};
</script>
