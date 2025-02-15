import { petState, pictureUrlState } from "atoms";
import { DropZone } from "components/dropzone";
import { deleteUserPet, editUserPet } from "lib/api";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useRecoilState, useRecoilValue } from "recoil";
import { MainButton } from "ui/buttons";
import { MapboxSearch } from "components/map";
import "mapbox-gl/dist/mapbox-gl.css";
import { MyTextInput } from "ui/text-field";
import css from "./index.css";
import { useEditPet } from "hooks/hooks";

export function EditForm() {
  const token = localStorage.getItem("auth_token");
  const petData = useRecoilValue(petState);
  const [formData, setFormData] = useState(null);
  const [pictureUrl, setPictureUrl] = useRecoilState(pictureUrlState);
  const { editPet } = useEditPet();
  const navigate = useNavigate();

  //seteo la url de la foto de la mascota
  useEffect(() => {
    setPictureUrl(petData?.pictureUrl);
  }, []);
  //si el user edita la foto cargo la nueva url
  useEffect(() => {
    setFormData({ ...formData, pictureUrl });
  }, [pictureUrl]);

  async function submitHandler(e) {
    e.preventDefault();
    const name = e.target.name.value;

    const allData = {
      name,
      lat: formData?.mapbox?.coords[1],
      lng: formData?.mapbox?.coords[0],
      pictureUrl: pictureUrl,
      zone: formData?.mapbox?.zone,
      condition: "lost",
      newPicture: false,
    };
    //si hay una nueva url de la foto debo agregar
    //el campo newPicture para que la api sepa que se esta modificando
    if (formData?.pictureUrl) {
      allData.newPicture = true;
      allData.pictureUrl = formData.pictureUrl;
    }
    //hago la llamada a la api para modifcar la mascota
    const res = await editPet({ body: allData, token, id: petData.id });
    if (res) {
      alert("mascota modificada");
      navigate("/user/pets");
    } else {
      alert("ups algo salio mal, intenta mas tarde");
    }
  }
  //guardo los datos provenientes del mapbox
  function handleMapboxChange(data) {
    setFormData({
      ...formData,
      mapbox: data,
    });
  }
  //funcion que cambia el estado de una mascota a "encontrado"
  function handleReport() {
    const flag = confirm("¿Desea reportar como encontrado?");
    const body = { condition: "found" };
    if (flag) {
      editUserPet({ body, token, id: petData.id }).then((res) => {
        if (res[0] === 1) {
          console.log("mascota encontrada");
          navigate("/user/pets");
        } else {
          alert("ups algo salio mal, intenta mas tarde");
        }
      });
    }
  }
  //funcion que elimina una mascota del usuario
  function handleUnpublish() {
    const flag = confirm("¿Desea despublicar la mascota?");
    if (flag) {
      deleteUserPet({ token, id: petData.id }).then((res) => {
        if (res === 1) {
          console.log("mascota eliminada");
          navigate("/user/pets");
        } else {
          alert("ups algo salio mal, intenta mas tarde");
        }
      });
    }
  }

  return (
    <form action="" className={css.form} onSubmit={submitHandler}>
      <MyTextInput
        label="NOMBRE"
        type="text"
        name="name"
        value={petData?.name}
      />
      <DropZone imgUrl={petData?.pictureUrl}></DropZone>
      <MapboxSearch type="edit" onChange={handleMapboxChange}></MapboxSearch>
      <MainButton className={css.button} type="submit">
        Guardar
      </MainButton>
      <MainButton
        color="accept"
        className={css.button}
        type="button"
        onClick={handleReport}
      >
        Reportar como encontrado
      </MainButton>
      <MainButton
        color="cancel"
        className={css.button}
        type="button"
        onClick={handleUnpublish}
      >
        Despublicar
      </MainButton>
    </form>
  );
}
