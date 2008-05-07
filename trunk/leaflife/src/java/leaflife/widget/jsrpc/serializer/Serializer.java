package leaflife.widget.jsrpc.serializer;

import leaflife.widget.jsrpc.InvalidJSONSyntaxException;
import leaflife.widget.jsrpc.InvocationException;
import leaflife.widget.jsrpc.MarshallException;
import leaflife.widget.jsrpc.Tokener;
import leaflife.widget.jsrpc.UnmarshallException;

/**
 * Interface to be implemented by custom serializer that convert to and from Java objects and JSON string.
 */
public interface Serializer
{
    /**
     * Returns the serializable classes this serializer can convert to and from Java objects and JSON string.
     * @return the array of Class objects representing the serializable class
     */
    public Class[] getSerializableClasses();

    /**
     * Tests if this serializer can marshall at specified marshall level.
     * @param level the marshall level (start from 1)
     * @return true if this serializer can marshall, false otherwise
     */
    public boolean canMarshall(int level);

    /**
     * Converts the Java object to a JSON string.
     * @param obj the Java object to be converted
     * @param level the serialization level (start from 1)
     * @return a JSON string representation of the Java object
     * @throws MarshallException if the object can not be converted to the JSON string
     */
    public String marshall(Object obj, int level) throws MarshallException;

    /**
     * Converts the JSON string to a Java object.
     * @param json the JSON string to be converted
     * @param desired_class the type of Java object after convert
     * @return an Java object representation of the JSON string
     * @throws InvalidJSONSyntaxException if the syntax JSON string is invalid
     * @throws UnmarshallException if the JSON string can not be converted to the specified java object
     * @throws InvocationException if instantiating the specified class failed
     */
    public Object unmarshall(Tokener json, Class desired_class) throws InvalidJSONSyntaxException, UnmarshallException, InvocationException;
}
