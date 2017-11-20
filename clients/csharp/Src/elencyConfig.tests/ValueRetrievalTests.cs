using System;
using NUnit.Framework;
using System.Runtime.Serialization;

namespace ElencyConfig.Tests
{
    [TestFixture]
    public class ValueRetrievalTests
    {
        [TestFixture]
        public class GetBoolean
        {
            [Test]
            public void ReturnsNullIfValueIsNull()
            {
                var value = ValueRetrieval.GetBoolean(null);
                Assert.That(value, Is.EqualTo(null));
            }

            [Test]
            public void ReturnsNullIfValueIsasdf()
            {
                var value = ValueRetrieval.GetBoolean("adsf");
                Assert.That(value, Is.EqualTo(null));
            }

            [Test]
            public void ReturnsTrueIfValueIs1()
            {
                var value = ValueRetrieval.GetBoolean("1");
                Assert.That(value, Is.EqualTo(true));
            }

            [Test]
            public void ReturnsTrueIfValueIstrue()
            {
                var value = ValueRetrieval.GetBoolean("true");
                Assert.That(value, Is.EqualTo(true));
            }

            [Test]
            public void ReturnsTrueIfValueIsTRUE()
            {
                var value = ValueRetrieval.GetBoolean("TRUE");
                Assert.That(value, Is.EqualTo(true));
            }

            [Test]
            public void ReturnsFalseIfValueIs0()
            {
                var value = ValueRetrieval.GetBoolean("0");
                Assert.That(value, Is.EqualTo(false));
            }

            [Test]
            public void ReturnsFalseIfValueIsfalse()
            {
                var value = ValueRetrieval.GetBoolean("false");
                Assert.That(value, Is.EqualTo(false));
            }

            [Test]
            public void ReturnsFalseIfValueIsFALSE()
            {
                var value = ValueRetrieval.GetBoolean("FALSE");
                Assert.That(value, Is.EqualTo(false));
            }

            [Test]
            public void ReturnsTrueIfValueIsNullAndFallbackIstrue()
            {
                var value = ValueRetrieval.GetBoolean(null, true);
                Assert.That(value, Is.EqualTo(true));
            }

            [Test]
            public void ReturnsFalseIfValueIsasdfAndFallbackIsfalse()
            {
                var value = ValueRetrieval.GetBoolean("asdf", false);
                Assert.That(value, Is.EqualTo(false));
            }
        }

        [TestFixture]
        public class GetDateTime
        {
            [Test]
            public void ReturnsNullIfValueIsNull()
            {
                var value = ValueRetrieval.GetDateTime(null);
                Assert.That(value, Is.EqualTo(null));
            }

            [Test]
            public void ReturnsNullIfValueIsasdf()
            {
                var value = ValueRetrieval.GetDateTime("asdf");
                Assert.That(value, Is.EqualTo(null));
            }

            [Test]
            public void ReturnsDateTimeObjectIfValueIsAValidDateTime()
            {
                var value = ValueRetrieval.GetDateTime("2018-02-06T12:35:45.970Z");
                Assert.That(value.Value.ToString(), Is.EqualTo("06/02/2018 12:35:45"));
            }

            [Test]
            public void ReturnsDateTimeObjectIfValueIsNullAndFallbackIsAValidDateTime()
            {
                var value = ValueRetrieval.GetDateTime(null, DateTime.Parse("2018-02-06T12:35:45.970Z"));
                Assert.That(value.Value.ToString(), Is.EqualTo("06/02/2018 12:35:45"));
            }

            [Test]
            public void ReturnsDateTimeObjectIfValueIsasdfAndFallbackIsAValidDateTime()
            {
                var value = ValueRetrieval.GetDateTime("adsf", DateTime.Parse("2018-02-06T12:35:45.970Z"));
                Assert.That(value.Value.ToString(), Is.EqualTo("06/02/2018 12:35:45"));
            }
        }

        [TestFixture]
        public class GetInteger
        {
            [Test]
            public void ReturnsNullIfValueIsNull()
            {
                var value = ValueRetrieval.GetInteger(null);
                Assert.That(value, Is.EqualTo(null));
            }

            [Test]
            public void ReturnsNullIfValueIsasdf()
            {
                var value = ValueRetrieval.GetInteger("asdf");
                Assert.That(value, Is.EqualTo(null));
            }

            [Test]
            public void Returns1IfValueIs1()
            {
                var value = ValueRetrieval.GetInteger("1");
                Assert.That(value, Is.EqualTo(1));
            }

            [Test]
            public void Returns10IfValueIsNullAndFallbackIs10()
            {
                var value = ValueRetrieval.GetInteger(null, 10);
                Assert.That(value, Is.EqualTo(10));
            }

            [Test]
            public void Returns15IfValueIsasdfAndFallbackIs15()
            {
                var value = ValueRetrieval.GetInteger("asdf", 15);
                Assert.That(value, Is.EqualTo(15));
            }
        }

        [TestFixture]
        public class GetFloat
        {
            [Test]
            public void ReturnsNullIfValueIsNull()
            {
                var value = ValueRetrieval.GetFloat(null);
                Assert.That(value, Is.EqualTo(null));
            }

            [Test]
            public void ReturnsNullIfValueIsasdf()
            {
                var value = ValueRetrieval.GetFloat("asdf");
                Assert.That(value, Is.EqualTo(null));
            }

            [Test]
            public void Returns1Point12IfValueIs1Point12()
            {
                var value = ValueRetrieval.GetFloat("1.12");
                Assert.That(value, Is.EqualTo((float)1.12));
            }

            [Test]
            public void Returns1Point3IfValueIsNullAndFallbackIs1Point3()
            {
                var value = ValueRetrieval.GetFloat(null, (float)1.3);
                Assert.That(value, Is.EqualTo((float)1.3));
            }

            [Test]
            public void Returns2Point7IfValueIsasdfAndFallbackIs2Point7()
            {
                var value = ValueRetrieval.GetFloat("asdf", (float)2.7);
                Assert.That(value, Is.EqualTo((float)2.7));
            }
        }

        [TestFixture]
        public class GetDecimal
        {
            [Test]
            public void ReturnsNullIfValueIsNull()
            {
                var value = ValueRetrieval.GetDecimal(null);
                Assert.That(value, Is.EqualTo(null));
            }

            [Test]
            public void ReturnsNullIfValueIsasdf()
            {
                var value = ValueRetrieval.GetDecimal("asdf");
                Assert.That(value, Is.EqualTo(null));
            }

            [Test]
            public void Returns1Point12IfValueIs1Point12()
            {
                var value = ValueRetrieval.GetDecimal("1.12");
                Assert.That(value, Is.EqualTo((decimal)1.12));
            }

            [Test]
            public void Returns1Point3IfValueIsNullAndFallbackIs1Point3()
            {
                var value = ValueRetrieval.GetDecimal(null, (decimal)1.3);
                Assert.That(value, Is.EqualTo((decimal)1.3));
            }

            [Test]
            public void Returns2Point7IfValueIsasdfAndFallbackIs2Point7()
            {
                var value = ValueRetrieval.GetDecimal("asdf", (decimal)2.7);
                Assert.That(value, Is.EqualTo((decimal)2.7));
            }
        }

        [TestFixture]
        public class GetDouble
        {
            [Test]
            public void ReturnsNullIfValueIsNull()
            {
                var value = ValueRetrieval.GetDouble(null);
                Assert.That(value, Is.EqualTo(null));
            }

            [Test]
            public void ReturnsNullIfValueIsasdf()
            {
                var value = ValueRetrieval.GetDouble("asdf");
                Assert.That(value, Is.EqualTo(null));
            }

            [Test]
            public void Returns1Point12IfValueIs1Point12()
            {
                var value = ValueRetrieval.GetDouble("1.12");
                Assert.That(value, Is.EqualTo((double)1.12));
            }

            [Test]
            public void Returns1Point3IfValueIsNullAndFallbackIs1Point3()
            {
                var value = ValueRetrieval.GetDouble(null, (double)1.3);
                Assert.That(value, Is.EqualTo((double)1.3));
            }

            [Test]
            public void Returns2Point7IfValueIsasdfAndFallbackIs2Point7()
            {
                var value = ValueRetrieval.GetDouble("asdf", (double)2.7);
                Assert.That(value, Is.EqualTo((double)2.7));
            }
        }
        
        [TestFixture]
        public class GetObject
        {
            [DataContract]
            public class TestObject
            {
                [DataMember]
                public bool On { get; set; }
            }

            [Test]
            public void ReturnsNullIfValueIsNull()
            {
                var value = ValueRetrieval.GetObject<TestObject>(null);
                Assert.That(value, Is.EqualTo(null));
            }

            [Test]
            public void ReturnsNullIfValueIsasdf()
            {
                var value = ValueRetrieval.GetObject<TestObject>("asdf");
                Assert.That(value, Is.EqualTo(null));
            }

            [Test]
            public void ReturnsTestObjectIfValueIsATestObject()
            {
                var value = ValueRetrieval.GetObject<TestObject>("{\"On\": \"true\"}");
                Assert.That(value.On, Is.EqualTo(true));
            }
        }
    }
}
