#ifndef ___REGISTERS_H___
#define ___REGISTERS_H___

#include <node.h>

#include <nan.h>

class Registers : public node::ObjectWrap {

public:
  static NAN_MODULE_INIT(Init);

  static NAN_METHOD(New);
  static NAN_METHOD(Open);
  static NAN_METHOD(Close);
  static NAN_METHOD(Read);
  static NAN_METHOD(Write);

private:
  Registers();
  ~Registers();

  void _open();
  void _close();

  uint32_t _read(uint32_t address);
  void _write(uint32_t address, uint32_t value);

private:
  Nan::Persistent<v8::Object> This;

  int _fd;
  uint8_t* _registers;

  static Nan::Persistent<v8::FunctionTemplate> constructor_template;
};

#endif
