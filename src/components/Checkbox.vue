<style scoped>
  .container {
    --input-focus: #2d8cf0;
    --input-out-of-focus: #fff;
    --bg-color: #111;
    --bg-color-alt: #7e7e7e;
    --main-color: #fefefe;
    position: relative;
    cursor: pointer;
  }

  .container input {
    position: absolute;
    opacity: 0;
  }

  .checkmark {
    width: 20px;
    height: 20px;
    position: relative;
    top: 0;
    left: 0;
    border: 2px solid var(--main-color);
    border-radius: 5px;
    box-shadow: 4px 4px var(--main-color);
    background-color: var(--input-out-of-focus);
    transition: all 0.3s;
  }

  .container input:checked ~ .checkmark {
    background-color: var(--input-focus);
  }

  .checkmark:after {
    content: "";
    width: 5px;
    height: 10px;
    position: absolute;
    top: 0px;
    left: 4px;
    display: none;
    border: solid var(--main-color);
    border-width: 0 2.5px 2.5px 0;
    transform: rotate(45deg);
  }

  .container input:checked ~ .checkmark:after {
    display: block;
  }
</style>

<template>
  <label class="container">
    <input type="checkbox" checked="checked">
    <div class="checkmark"></div>
  </label>
</template>


<script>
export default{
    name: 'Checkbox',
}
</script>
