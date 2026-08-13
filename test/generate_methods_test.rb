# frozen_string_literal: true

require "minitest/autorun"
require "open3"
require "rbconfig"

require_relative "../scripts/generate_methods"

class GenerateMethodsTest < Minitest::Test
  FakeLibrary = Struct.new(:name)
  FakeClass = Struct.new(:name)
  FakeEntry = Struct.new(
    :library, :typename, :visibility, :undefined, :klass, :name, :source, :typechar,
    keyword_init: true
  ) do
    def undefined?
      undefined
    end
  end

  def sample_entry(**attributes)
    defaults = {
      library: FakeLibrary.new("_builtin"),
      typename: :instance_method,
      visibility: :public,
      undefined: false,
      klass: FakeClass.new("Array"),
      name: "sample",
      source: <<~SOURCE,
        ### def sample -> object | nil
        ### def sample(n) -> Array

        配列から `n` 個をランダムに選びます。&amp;

        ```ruby
        [1, 2, 3].sample
        ```
      SOURCE
      typechar: "i"
    }
    FakeEntry.new(**defaults.merge(attributes))
  end

  def test_require_does_not_need_a_bitclust_database
    script = File.expand_path("../scripts/generate_methods", __dir__)
    _output, error, status = Open3.capture3(RbConfig.ruby, "--disable-gems", "-e", "require ARGV.fetch(0)", script)

    assert_predicate status, :success?, error
  end

  def test_payload_is_valid_json_with_required_keys
    payload = GenerateMethods.payload_for([sample_entry])
    json = JSON.parse(JSON.generate(payload))
    record = json.fetch("methods").fetch(0)

    assert_equal "4.0", json.fetch("ruby_version")
    assert_equal "_builtin", json.fetch("source_library")
    refute_empty json.fetch("methods")
    GenerateMethods::REQUIRED_RECORD_KEYS.each { |key| assert record.key?(key.to_s) }
  end

  def test_only_public_builtin_supported_methods_are_selected
    valid = sample_entry
    private_method = sample_entry(visibility: :private)
    other_library = sample_entry(library: FakeLibrary.new("json"))
    undefined_method = sample_entry(undefined: true)
    unsupported_kind = sample_entry(typename: :constant)

    assert_equal [valid], GenerateMethods.selected_entries([valid, private_method, other_library, undefined_method, unsupported_kind])
  end

  def test_missing_example_becomes_json_null
    entry = sample_entry(source: "### def sample -> object\n\n説明です。\n")
    json = JSON.parse(JSON.generate(GenerateMethods.payload_for([entry])))

    assert_nil json.fetch("methods").fetch(0).fetch("example")
  end

  def test_array_sample_has_expected_record_format
    record = GenerateMethods.record_for(sample_entry)

    assert_equal "sample", record.fetch(:method_name)
    assert_equal "Array", record.fetch(:class_name)
    assert_equal "instance_method", record.fetch(:method_kind)
    assert_equal ["sample -> object | nil", "sample(n) -> Array"], record.fetch(:signatures)
    assert_equal "https://docs.ruby-lang.org/ja/4.0/method/Array/i/sample.html", record.fetch(:rurema_url)
  end

  def test_encodes_symbol_method_names_for_rurema_urls
    assert_equal "=5b=5d", GenerateMethods.encode_rurema_name("[]")
    assert_equal "=5b=5d=3d", GenerateMethods.encode_rurema_name("[]=")
    assert_equal "=3c=3d=3e", GenerateMethods.encode_rurema_name("<=>")
  end

  def test_duplicate_method_keys_are_detected
    record = GenerateMethods.record_for(sample_entry)

    assert_equal [GenerateMethods.method_key(record)], GenerateMethods.duplicate_method_keys([record, record.dup])
    assert_raises(RuntimeError) { GenerateMethods.payload_for([sample_entry, sample_entry]) }
  end
end
